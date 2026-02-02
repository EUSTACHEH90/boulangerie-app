// src/app/api/produits/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/lib/services/product.service'
import { createProductSchema, getProductsQuerySchema } from '@/lib/validations/product'
import { requireAuth } from '@/lib/auth-middleware'
import { ZodError } from 'zod'

/**
 * GET /api/produits
 * 
 * Récupère la liste des produits (PUBLIC)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rawParams = {
      category: searchParams.get('category'),
      status: searchParams.get('status'),
      isAvailable: searchParams.get('isAvailable'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search'),
    }

    const filteredParams = Object.fromEntries(
      Object.entries(rawParams).filter(([_, v]) => v != null)
    )

    const validatedParams = getProductsQuerySchema.parse(filteredParams)
    const result = await ProductService.getAll(validatedParams)

    return NextResponse.json({
      success: true,
      data: result.products,
      pagination: result.pagination,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Paramètres invalides',
          details: error.issues, // ✅ Correction : issues au lieu de errors
        },
        { status: 400 }
      )
    }

    console.error('Erreur GET /api/produits:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des produits',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/produits
 * 
 * Crée un nouveau produit (ADMIN UNIQUEMENT)
 */
export async function POST(request: NextRequest) {
  try {
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

    const validatedData = createProductSchema.parse(body)
    const product = await ProductService.create(validatedData)

    return NextResponse.json(
      {
        success: true,
        data: product,
        message: 'Produit créé avec succès',
        createdBy: admin.email,
      },
      { status: 201 }
    )
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

    if (error instanceof Error && error.message === 'Ce slug existe déjà') {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 409 }
      )
    }

    console.error('Erreur POST /api/produits:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la création du produit',
      },
      { status: 500 }
    )
  }
}