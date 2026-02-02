// src/app/api/admin/produits/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { verifyToken, extractTokenFromHeader, AUTH_ERRORS } from '@/lib/auth'

export async function GET(request: NextRequest) {
  // Vérifier l'authentification
  const authHeader = request.headers.get('Authorization')
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    return NextResponse.json(
      { error: AUTH_ERRORS.UNAUTHORIZED },
      { status: 401 }
    )
  }

  const payload = verifyToken(token)

  if (!payload) {
    return NextResponse.json(
      { error: AUTH_ERRORS.TOKEN_INVALID },
      { status: 401 }
    )
  }

  // L'admin est authentifié, continuer...
  const products = await prisma.product.findMany()

  return NextResponse.json({ products, admin: payload })
}