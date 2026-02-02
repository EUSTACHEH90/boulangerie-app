// src/lib/payment/providers/flutterwave.provider.ts

import {
  PaymentProvider,
  InitPaymentData,
  InitPaymentResponse,
  VerifyPaymentResponse,
} from './base.provider'
import { PaymentStatus } from '@prisma/client'
import crypto from 'crypto'

/**
 * Provider Flutterwave pour paiements Mobile Money
 * Supporte: Orange Money, MTN, Vodafone, etc.
 */
export class FlutterwaveProvider extends PaymentProvider {
  private secretKey: string
  private publicKey: string
  private encryptionKey: string

  constructor(config: {
    secretKey: string
    publicKey: string
    encryptionKey: string
    isProduction?: boolean
  }) {
    super({
      apiKey: config.secretKey,
      baseUrl: config.isProduction
        ? 'https://api.flutterwave.com/v3'
        : 'https://api.flutterwave.com/v3', // Pas de sandbox séparé
      isProduction: config.isProduction,
    })
    this.secretKey = config.secretKey
    this.publicKey = config.publicKey
    this.encryptionKey = config.encryptionKey
  }

  getName(): string {
    return 'Flutterwave'
  }

  /**
   * Initialise un paiement Flutterwave
   */
  async initPayment(data: InitPaymentData): Promise<InitPaymentResponse> {
    try {
      const txRef = `TX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.secretKey}`,
        },
        body: JSON.stringify({
          tx_ref: txRef,
          amount: data.amount,
          currency: data.currency || 'XOF',
          redirect_url: data.returnUrl || `${process.env.APP_URL}/commandes/${data.orderId}/success`,
          payment_options: 'mobilemoneyghana,mobilemoneyuganda,mobilemoneyrwanda,mobilemoneyzambia',
          customer: {
            email: data.customerEmail || `${data.customerPhone}@temp.com`,
            phonenumber: data.customerPhone,
            name: data.customerName,
          },
          customizations: {
            title: process.env.STORE_NAME || 'Ma Boulangerie',
            description: data.description || `Commande #${data.orderId}`,
            logo: process.env.STORE_LOGO,
          },
          meta: {
            order_id: data.orderId,
            ...data.metadata,
          },
        }),
      })

      const result = await response.json()

      if (!response.ok || result.status !== 'success') {
        return {
          success: false,
          transactionId: txRef,
          error: result.message || 'Erreur lors de l\'initialisation du paiement',
        }
      }

      return {
        success: true,
        transactionId: txRef,
        paymentUrl: result.data.link,
        checkoutToken: txRef,
      }
    } catch (error) {
      console.error('Erreur Flutterwave initPayment:', error)
      return {
        success: false,
        transactionId: '',
        error: 'Erreur de connexion au service de paiement',
      }
    }
  }

  /**
   * Vérifie le statut d'un paiement
   */
  async verifyPayment(transactionId: string): Promise<VerifyPaymentResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/transactions/${transactionId}/verify`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        }
      )

      const result = await response.json()

      if (!response.ok || result.status !== 'success') {
        return {
          success: false,
          status: 'FAILED',
          transactionId,
          amount: 0,
          currency: 'XOF',
          failureReason: result.message || 'Transaction non trouvée',
        }
      }

      const txData = result.data

      // Mapper le statut Flutterwave vers notre enum
      let status: PaymentStatus = 'PENDING'
      if (txData.status === 'successful') {
        status = 'COMPLETED'
      } else if (txData.status === 'failed' || txData.status === 'cancelled') {
        status = 'FAILED'
      }

      return {
        success: txData.status === 'successful',
        status,
        transactionId: txData.tx_ref,
        amount: parseFloat(txData.amount),
        currency: txData.currency,
        customerPhone: txData.customer?.phone_number,
        customerName: txData.customer?.name,
        paidAt: txData.status === 'successful' ? new Date(txData.created_at) : undefined,
        metadata: txData.meta,
      }
    } catch (error) {
      console.error('Erreur Flutterwave verifyPayment:', error)
      return {
        success: false,
        status: 'FAILED',
        transactionId,
        amount: 0,
        currency: 'XOF',
        failureReason: 'Erreur de vérification',
      }
    }
  }

  /**
   * Traite un webhook Flutterwave
   */
  async handleWebhook(payload: any, signature?: string): Promise<VerifyPaymentResponse> {
    // Vérifier la signature du webhook
    if (signature) {
      const hash = crypto
        .createHmac('sha256', this.secretKey)
        .update(JSON.stringify(payload))
        .digest('hex')

      if (hash !== signature) {
        throw new Error('Signature de webhook invalide')
      }
    }

    const transactionId = payload.data?.tx_ref

    if (!transactionId) {
      throw new Error('Transaction ID manquant dans le webhook')
    }

    // Toujours vérifier via l'API pour plus de sécurité
    return this.verifyPayment(transactionId)
  }
}