//app/admin/(dashboard)/commandes/[id]/update-status/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/db'
import { OrderStatus, PaymentStatus } from '@/lib/enums'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Vérifier l'authentification via cookie
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { id } = await context.params
    const body = await request.json()
    const { status, adminNotes } = body

    // Récupérer la commande pour vérifier l'existence du paiement
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { payment: true },
    })

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: 'Commande non trouvée' },
        { status: 404 }
      )
    }

    // ✅ Préparer les données de mise à jour
    const updateData: any = {
      status: status as OrderStatus,
      adminNotes: adminNotes || undefined,
      updatedAt: new Date(),
    }

    // Définir les dates selon le statut
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date()
    }
    if (status === 'CANCELLED') {
      updateData.cancelledAt = new Date()
    }

    // ✅ Utiliser une transaction pour mettre à jour la commande ET le paiement
    const result = await prisma.$transaction(async (tx) => {
      // Mettre à jour la commande
      const order = await tx.order.update({
        where: { id },
        data: updateData,
      })

      // ✅ Si la commande est marquée comme COMPLETED, marquer le paiement comme COMPLETED
      if (status === 'COMPLETED' && existingOrder.payment) {
        await tx.payment.update({
          where: { id: existingOrder.payment.id },
          data: {
            status: PaymentStatus.COMPLETED,
            completedAt: new Date(),
            updatedAt: new Date(),
          },
        })
      }

      // ✅ Si la commande est annulée, marquer le paiement comme FAILED
      if (status === 'CANCELLED' && existingOrder.payment) {
        await tx.payment.update({
          where: { id: existingOrder.payment.id },
          data: {
            status: PaymentStatus.FAILED,
            failureReason: 'Commande annulée par l\'administrateur',
            updatedAt: new Date(),
          },
        })
      }

      return order
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: status === 'COMPLETED' 
        ? 'Commande et paiement marqués comme terminés' 
        : status === 'CANCELLED'
        ? 'Commande annulée et paiement marqué comme échoué'
        : 'Statut mis à jour avec succès',
    })
  } catch (error) {
    console.error('Erreur mise à jour commande:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}