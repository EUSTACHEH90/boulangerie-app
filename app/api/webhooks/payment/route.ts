// src/app/api/webhooks/payment/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/lib/payment/payment.service'

/**
 * POST /api/webhooks/payment
 * 
 * Webhook pour les notifications de paiement
 */
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('verif-hash') || 
                     request.headers.get('x-paystack-signature') ||
                     request.headers.get('x-flutterwave-signature')
    
    const payload = await request.json()

    await PaymentService.handleWebhook(payload, signature || undefined)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur webhook payment:', error)
    // Toujours retourner 200 pour éviter les retry infinis
    return NextResponse.json({ success: false })
  }
}