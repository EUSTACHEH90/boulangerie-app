// app/api/commandes/verify/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// Rate limiting côté serveur par IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 })
    return false
  }

  if (record.count >= 5) return true

  record.count++
  return false
}

export async function GET(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown'

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: 'Trop de tentatives. Réessayez dans 10 minutes.' },
        { status: 429 }
      )
    }

    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')
    const orderNumber = searchParams.get('orderNumber')

    if (!phone || !orderNumber) {
      return NextResponse.json(
        { success: false, error: 'Téléphone et numéro de commande requis' },
        { status: 400 }
      )
    }

    // ✅ Vérification des deux critères en même temps
    const order = await prisma.order.findFirst({
      where: {
        customerPhone: phone,
        orderNumber: orderNumber.toUpperCase(),
      },
      include: {
        items: {
          select: {
            productName: true,
            quantity: true,
          },
        },
      },
    })

    // ✅ Message générique pour ne pas révéler si le téléphone existe
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Aucune commande trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: Number(order.total),
        isDelivery: order.isDelivery,
        createdAt: order.createdAt.toISOString(),
        items: order.items,
      },
    })

  } catch (error) {
    console.error('Erreur verify commande:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}