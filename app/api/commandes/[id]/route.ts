// src/app/api/commandes/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@/lib/services/order.service'
import { updateOrderStatusSchema } from '@/lib/validations/order'
import { requireAuth } from '@/lib/auth-middleware'
import { ZodError } from 'zod'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/commandes/[id]
 * 
 * Récupère une commande par son ID
 * PUBLIC si on a l'ID, mais en production il faudrait vérifier
 * que c'est bien le client de la commande ou un admin
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params  // ✅ Correction ici
    const order = await OrderService.getById(id)

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Commande non trouvée') {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 404 }
      )
    }

    console.error('Erreur GET /api/commandes/[id]:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération de la commande',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/commandes/[id]
 * 
 * Met à jour le statut d'une commande (ADMIN UNIQUEMENT)
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Vérifier l'authentification
    const authResult = await requireAuth(request)
    if (authResult.error) return authResult.response

    const admin = authResult.admin
    const { id } = await context.params  // ✅ Correction ici

    // Parser le body
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Format JSON invalide',
        },
        { status: 400 }
      )
    }

    // Valider les données
    const validatedData = updateOrderStatusSchema.parse(body)

    // Mettre à jour le statut
    const order = await OrderService.updateStatus(id, validatedData)

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Statut de la commande mis à jour avec succès',
      updatedBy: admin.email,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Données invalides',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      if (error.message === 'Commande non trouvée') {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 404 }
        )
      }

      if (error.message.includes('Transition de statut invalide')) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 400 }
        )
      }
    }

    console.error('Erreur PUT /api/commandes/[id]:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la mise à jour de la commande',
      },
      { status: 500 }
    )
  }
}