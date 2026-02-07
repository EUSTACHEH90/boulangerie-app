// src/lib/payment/providers/paydunya.provider.ts

import {
  PaymentProvider,
  InitPaymentData,
  InitPaymentResponse,
  VerifyPaymentResponse,
} from './base.provider'
import { PaymentStatus } from '@/types'

/**
 * Provider PayDunya pour paiements Mobile Money en Afrique de l'Ouest
 * Supporte: Orange Money, MTN Mobile Money, Moov Money
 */
export class PaydunyaProvider extends PaymentProvider {
  private masterKey: string
  private privateKey: string
  private token: string

  constructor(config: {
    masterKey: string
    privateKey: string
    token: string
    isProduction?: boolean
  }) {
    super({
      apiKey: config.masterKey,
      baseUrl: config.isProduction
        ? 'https://app.paydunya.com/api/v1'
        : 'https://app.paydunya.com/sandbox-api/v1',
      isProduction: config.isProduction,
    })
    this.masterKey = config.masterKey
    this.privateKey = config.privateKey
    this.token = config.token
  }

  getName(): string {
    return 'PayDunya'
  }

  /**
   * Initialise un paiement PayDunya
   */
  async initPayment(data: InitPaymentData): Promise<InitPaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/checkout-invoice/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'PAYDUNYA-MASTER-KEY': this.masterKey,
          'PAYDUNYA-PRIVATE-KEY': this.privateKey,
          'PAYDUNYA-TOKEN': this.token,
        },
        body: JSON.stringify({
          invoice: {
            total_amount: data.amount,
            description: data.description || `Commande #${data.orderId}`,
          },
          store: {
            name: process.env.STORE_NAME || 'Ma Boulangerie',
            website_url: process.env.STORE_URL || 'https://example.com',
          },
          custom_data: {
            order_id: data.orderId,
            ...data.metadata,
          },
          actions: {
            cancel_url: data.returnUrl || `${process.env.APP_URL}/commandes/${data.orderId}`,
            return_url: data.returnUrl || `${process.env.APP_URL}/commandes/${data.orderId}/success`,
            callback_url: data.callbackUrl || `${process.env.APP_URL}/api/webhooks/payment`,
          },
        }),
      })

      const result = await response.json()

      if (!response.ok || result.response_code !== '00') {
        return {
          success: false,
          transactionId: '',
          error: result.response_text || 'Erreur lors de l\'initialisation du paiement',
        }
      }

      return {
        success: true,
        transactionId: result.token,
        paymentUrl: result.response_text, // URL de paiement PayDunya
        checkoutToken: result.token,
      }
    } catch (error) {
      console.error('Erreur PayDunya initPayment:', error)
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
      const response = await fetch(`${this.baseUrl}/checkout-invoice/confirm/${transactionId}`, {
        method: 'GET',
        headers: {
          'PAYDUNYA-MASTER-KEY': this.masterKey,
          'PAYDUNYA-PRIVATE-KEY': this.privateKey,
          'PAYDUNYA-TOKEN': this.token,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          status: 'FAILED',
          transactionId,
          amount: 0,
          currency: 'XOF',
          failureReason: 'Transaction non trouvée',
        }
      }

      // Mapper le statut PayDunya vers notre enum
      let status: PaymentStatus = 'PENDING'
      if (result.status === 'completed') {
        status = 'COMPLETED'
      } else if (result.status === 'cancelled' || result.status === 'failed') {
        status = 'FAILED'
      }

      return {
        success: result.status === 'completed',
        status,
        transactionId,
        amount: parseFloat(result.invoice.total_amount),
        currency: 'XOF',
        customerPhone: result.customer?.phone,
        customerName: result.customer?.name,
        paidAt: result.status === 'completed' ? new Date() : undefined,
        metadata: result.custom_data,
      }
    } catch (error) {
      console.error('Erreur PayDunya verifyPayment:', error)
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
   * Traite un webhook PayDunya
   */
  async handleWebhook(payload: any, signature?: string): Promise<VerifyPaymentResponse> {
    // PayDunya envoie un hash pour vérifier l'authenticité
    // TODO: Implémenter la vérification de signature si nécessaire

    const transactionId = payload.data?.token || payload.token

    if (!transactionId) {
      throw new Error('Transaction ID manquant dans le webhook')
    }

    // Vérifier le paiement via l'API
    return this.verifyPayment(transactionId)
  }
}