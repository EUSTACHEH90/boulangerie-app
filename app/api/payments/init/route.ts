// src/app/api/payments/init/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/lib/payment/payment.service'


/**
 * POST /api/payments/init
 * 
 * Initialise un paiement pour une commande
 */
export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'ID de commande requis' },
        { status: 400 }
      )
    }

    const result = await PaymentService.initPayment(orderId)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Erreur init payment:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'initialisation du paiement',
      },
      { status: 500 }
    )
  }
}