// src/app/api/produits/slug/[slug]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/lib/services/product.service'

interface RouteContext {
  params: Promise<{ slug: string }>  // ✅ Promise
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { slug } = await context.params  // ✅ Await params
    const product = await ProductService.getBySlug(slug)

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Produit non trouvé') {
      return NextResponse.json(
        {
          success: false,
          error: 'Produit non trouvé',
        },
        { status: 404 }
      )
    }

    console.error('Erreur GET /api/produits/slug/[slug]:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération du produit',
      },
      { status: 500 }
    )
  }
}