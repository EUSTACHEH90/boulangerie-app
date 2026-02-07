// src/lib/payment/payment.service.ts

import prisma from '@/lib/db'
import { PaymentMethod, PaymentStatus }  from '@/types'
import { PaymentProvider, InitPaymentData } from './providers/base.provider'
import { PaydunyaProvider } from './providers/paydunya.provider'
import { FlutterwaveProvider } from './providers/flutterwave.provider'
import {  Prisma } from '@prisma/client'

/**
 * Factory pour créer le bon provider selon la méthode
 */
function getPaymentProvider(method: PaymentMethod = 'MOBILE_MONEY'): PaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER || 'paydunya'

  switch (provider.toLowerCase()) {
    case 'paydunya':
      return new PaydunyaProvider({
        masterKey: process.env.PAYDUNYA_MASTER_KEY!,
        privateKey: process.env.PAYDUNYA_PRIVATE_KEY!,
        token: process.env.PAYDUNYA_TOKEN!,
        isProduction: process.env.NODE_ENV === 'production',
      })

    case 'flutterwave':
      return new FlutterwaveProvider({
        secretKey: process.env.FLUTTERWAVE_SECRET_KEY!,
        publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY!,
        encryptionKey: process.env.FLUTTERWAVE_ENCRYPTION_KEY!,
        isProduction: process.env.NODE_ENV === 'production',
      })

    default:
      throw new Error(`Provider de paiement non supporté: ${provider}`)
  }
}

/**
 * Service de gestion des paiements
 */
export class PaymentService {
  /**
   * Initialise un paiement pour une commande
   */
  static async initPayment(orderId: string) {
    // Récupérer la commande avec le paiement
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    })

    if (!order) {
      throw new Error('Commande non trouvée')
    }

    if (!order.payment) {
      throw new Error('Aucun paiement associé à cette commande')
    }

    // Vérifier que le paiement est en attente
    if (order.payment.status !== 'PENDING') {
      throw new Error(`Le paiement est déjà ${order.payment.status}`)
    }

    // Obtenir le provider
    const provider = getPaymentProvider(order.payment.method)

    // Initialiser le paiement
    const paymentData: InitPaymentData = {
      amount: Number(order.total),
      currency: 'XOF',
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail || undefined,
      orderId: order.id,
      description: `Commande ${order.orderNumber}`,
      callbackUrl: `${process.env.APP_URL}/api/webhooks/payment`,
      returnUrl: `${process.env.APP_URL}/commandes/${order.id}/success`,
      metadata: {
        orderNumber: order.orderNumber,
        deliveryAddress: order.deliveryAddress,
      },
    }

    const result = await provider.initPayment(paymentData)

    if (!result.success) {
      // Mettre à jour le paiement en échec
      await prisma.payment.update({
        where: { id: order.payment.id },
        data: {
          status: 'FAILED',
          failureReason: result.error,
        },
      })

      throw new Error(result.error || 'Échec de l\'initialisation du paiement')
    }

    // Mettre à jour le paiement avec les infos de la transaction
    await prisma.payment.update({
      where: { id: order.payment.id },
      data: {
        status: 'PROCESSING',
        transactionId: result.transactionId,
        transactionRef: result.checkoutToken,
        metadata: {
          paymentUrl: result.paymentUrl,
          provider: provider.getName(),
        } as Prisma.InputJsonValue,
      },
    })

    return {
      success: true,
      paymentUrl: result.paymentUrl,
      transactionId: result.transactionId,
      provider: provider.getName(),
    }
  }

  /**
   * Vérifie le statut d'un paiement
   */
  static async verifyPayment(paymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    })

    if (!payment) {
      throw new Error('Paiement non trouvé')
    }

    if (!payment.transactionId) {
      throw new Error('Aucune transaction initialisée')
    }

    // Obtenir le provider
    const provider = getPaymentProvider(payment.method)

    // Vérifier le paiement
    const result = await provider.verifyPayment(payment.transactionId)

    // Mettre à jour le paiement
    const updateData: Prisma.PaymentUpdateInput = {
      status: result.status,
      ...(result.paidAt && { completedAt: result.paidAt }),
      ...(result.failureReason && { failureReason: result.failureReason }),
      metadata: {
        ...(payment.metadata as object),
        verificationData: result.metadata,
      } as Prisma.InputJsonValue,
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: updateData,
    })

    // Si le paiement est confirmé, mettre à jour la commande
    if (result.status === 'COMPLETED' && payment.order.status === 'PENDING') {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'CONFIRMED' },
      })
    }

    // Si le paiement a échoué, annuler la commande
    if (result.status === 'FAILED' && payment.order.status === 'PENDING') {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          adminNotes: `Paiement échoué: ${result.failureReason}`,
        },
      })
    }

    return result
  }

  /**
   * Traite un webhook de paiement
   */
  static async handleWebhook(payload: any, signature?: string, providerName?: string) {
    // Déterminer le provider depuis le payload ou les headers
    const provider = providerName
      ? getPaymentProvider()
      : getPaymentProvider()

    // Traiter le webhook
    const result = await provider.handleWebhook(payload, signature)

    // Trouver le paiement associé
    const payment = await prisma.payment.findFirst({
      where: { transactionId: result.transactionId },
      include: { order: true },
    })

    if (!payment) {
      console.error('Paiement non trouvé pour la transaction:', result.transactionId)
      return result
    }

    // Mettre à jour le paiement (même logique que verifyPayment)
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: result.status,
        ...(result.paidAt && { completedAt: result.paidAt }),
        ...(result.failureReason && { failureReason: result.failureReason }),
        metadata: {
          ...(payment.metadata as object),
          webhookData: result.metadata,
        } as Prisma.InputJsonValue,
      },
    })

    // Mettre à jour la commande
    if (result.status === 'COMPLETED' && payment.order.status === 'PENDING') {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'CONFIRMED' },
      })
    }

    if (result.status === 'FAILED' && payment.order.status === 'PENDING') {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          adminNotes: `Paiement échoué: ${result.failureReason}`,
        },
      })
    }

    return result
  }
}