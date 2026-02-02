// src/app/api/commandes/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@/lib/services/order.service'
import { createOrderSchema, getOrdersQuerySchema } from '@/lib/validations/order'
import { requireAuth } from '@/lib/auth-middleware'
import { ZodError } from 'zod'

/**
 * GET /api/commandes
 * 
 * Récupère la liste des commandes (ADMIN UNIQUEMENT)
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authResult = await requireAuth(request)
    if (authResult.error) return authResult.response

    // Parser les query params
    const { searchParams } = new URL(request.url)
    const rawParams = {
      status: searchParams.get('status'),
      customerPhone: searchParams.get('customerPhone'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    }

    const filteredParams = Object.fromEntries(
      Object.entries(rawParams).filter(([_, v]) => v != null)
    )

    const validatedParams = getOrdersQuerySchema.parse(filteredParams)

    // Récupérer les commandes
    const result = await OrderService.getAll(validatedParams)

    return NextResponse.json({
      success: true,
      data: result.orders,
      pagination: result.pagination,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Paramètres invalides',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    console.error('Erreur GET /api/commandes:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des commandes',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/commandes
 * 
 * Crée une nouvelle commande (PUBLIC - pour les clients)
 */
export async function POST(request: NextRequest) {
  try {
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
    const validatedData = createOrderSchema.parse(body)

    // Vérifier la cohérence des données de livraison
    if (validatedData.isDelivery && !validatedData.deliveryAddress) {
      return NextResponse.json(
        {
          success: false,
          error: 'L\'adresse de livraison est requise pour une livraison',
        },
        { status: 400 }
      )
    }

    // Vérifier les données de paiement Mobile Money
    if (
      validatedData.paymentMethod === 'MOBILE_MONEY' &&
      (!validatedData.phoneNumber || !validatedData.operator)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le numéro de téléphone et l\'opérateur sont requis pour Mobile Money',
        },
        { status: 400 }
      )
    }

    // Créer la commande
    const order = await OrderService.create(validatedData)

    return NextResponse.json(
      {
        success: true,
        data: order,
        message: 'Commande créée avec succès',
      },
      { status: 201 }
    )
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
      // Erreurs métier
      if (
        error.message.includes('non disponibles') ||
        error.message.includes('Stock insuffisant')
      ) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 400 }
        )
      }
    }

    console.error('Erreur POST /api/commandes:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la création de la commande',
      },
      { status: 500 }
    )
  }
}