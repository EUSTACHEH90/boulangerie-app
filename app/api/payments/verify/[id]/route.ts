// src/app/api/payments/verify/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/lib/payment/payment.service'

/**
 * GET /api/payments/verify/[id]
 * 
 * Vérifie le statut d'un paiement
 */
interface RouteContext {
  params: Promise<{ id: string }>  // ✅ Promise
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const result = await PaymentService.verifyPayment(id)
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