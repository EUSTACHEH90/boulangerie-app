// app/api/produits/slug/[slug]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/lib/services/product.service'

interface RouteContext {
  params: Promise<{ slug: string }>
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { slug } = await context.params
    
    console.log('🔍 Recherche du produit avec slug:', slug) // ✅ Log
    
    const product = await ProductService.getBySlug(slug)
    
    console.log('✅ Produit trouvé:', product.id) // ✅ Log

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error('❌ Erreur détaillée:', error) // ✅ Log détaillé
    
    if (error instanceof Error && error.message === 'Produit non trouvé') {
      return NextResponse.json(
        {
          success: false,
          error: 'Produit non trouvé',
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur serveur',
        details: error instanceof Error ? error.message : 'Unknown error', // ✅ Plus de détails
      },
      { status: 500 }
    )
  }
}