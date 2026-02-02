// src/app/api/produits/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/lib/services/product.service'
import { updateProductSchema } from '@/lib/validations/product'
import { requireAuth } from '@/lib/auth-middleware'
import { ZodError } from 'zod'

interface RouteContext {
  params: Promise<{ id: string }>
}
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const product = await ProductService.getById(id)

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Produit non trouvé') {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 404 }
      )
    }

    console.error('Erreur GET /api/produits/[id]:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération du produit',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/produits/[id]
 */
export async function PUT(
  request: NextRequest, context: RouteContext
) {
  try {
    const { id } = await context.params
    const authResult = await requireAuth(request)
    if (authResult.error) return authResult.response

    const admin = authResult.admin

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

    const validatedData = updateProductSchema.parse(body)

    if (Object.keys(validatedData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Aucune donnée à mettre à jour',
        },
        { status: 400 }
      )
    }

    const product = await ProductService.update(id, validatedData)

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Produit mis à jour avec succès',
      updatedBy: admin.email,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Données invalides',
          details: error.issues, // ✅ Correction : issues au lieu de errors
        },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      if (error.message === 'Produit non trouvé') {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 404 }
        )
      }

      if (error.message === 'Ce slug existe déjà') {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 409 }
        )
      }
    }

    console.error('Erreur PUT /api/produits/[id]:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la mise à jour du produit',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/produits/[id]
 */
export async function DELETE(
  request: NextRequest, context: RouteContext
) {
  try {
    const { id } = await context.params
    const authResult = await requireAuth(request)
    if (authResult.error) return authResult.response

    const admin = authResult.admin

    await ProductService.delete(id)

    return NextResponse.json({
      success: true,
      message: 'Produit supprimé avec succès',
      deletedBy: admin.email,
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Produit non trouvé') {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 404 }
        )
      }

      if (error.message.includes('lié à des commandes')) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            suggestion: 'Utilisez PATCH /api/produits/[id]/archive pour archiver le produit',
          },
          { status: 409 }
        )
      }
    }

    console.error('Erreur DELETE /api/produits/[id]:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la suppression du produit',
      },
      { status: 500 }
    )
  }
}