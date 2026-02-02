// src/lib/payment/providers/base.provider.ts

import { PaymentMethod, PaymentStatus } from '@prisma/client'

/**
 * Réponse d'initialisation de paiement
 */
export interface InitPaymentResponse {
  success: boolean
  transactionId: string
  paymentUrl?: string
  checkoutToken?: string
  qrCode?: string
  message?: string
  error?: string
}

/**
 * Réponse de vérification de paiement
 */
export interface VerifyPaymentResponse {
  success: boolean
  status: PaymentStatus
  transactionId: string
  amount: number
  currency: string
  customerPhone?: string
  customerName?: string
  paidAt?: Date
  failureReason?: string
  metadata?: Record<string, any>
}

/**
 * Données pour initialiser un paiement
 */
export interface InitPaymentData {
  amount: number
  currency?: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  orderId: string
  description?: string
  callbackUrl?: string
  returnUrl?: string
  metadata?: Record<string, any>
}

/**
 * Interface de base pour tous les providers de paiement
 */
export abstract class PaymentProvider {
  protected apiKey: string
  protected apiSecret?: string
  protected baseUrl: string
  protected isProduction: boolean

  constructor(config: {
    apiKey: string
    apiSecret?: string
    baseUrl?: string
    isProduction?: boolean
  }) {
    this.apiKey = config.apiKey
    this.apiSecret = config.apiSecret
    this.baseUrl = config.baseUrl || ''
    this.isProduction = config.isProduction ?? false
  }

  /**
   * Initialiser un paiement
   */
  abstract initPayment(data: InitPaymentData): Promise<InitPaymentResponse>

  /**
   * Vérifier le statut d'un paiement
   */
  abstract verifyPayment(transactionId: string): Promise<VerifyPaymentResponse>

  /**
   * Traiter un webhook
   */
  abstract handleWebhook(payload: any, signature?: string): Promise<VerifyPaymentResponse>

  /**
   * Nom du provider
   */
  abstract getName(): string
}