// src/app/api/payments/verify/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/lib/payment/payment.service'

/**
 * GET /api/payments/verify/[id]
 * 
 * Vérifie le statut d'un paiement
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await PaymentService.verifyPayment(params.id)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Erreur verify payment:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la vérification du paiement',
      },
      { status: 500 }
    )
  }
}