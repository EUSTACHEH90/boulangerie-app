// src/app/api/auth/logout/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader, AUTH_ERRORS } from '@/lib/auth'

/**
 * POST /api/auth/logout
 * 
 * Déconnecte un administrateur (invalidation côté client)
 * 
 * Headers requis:
 * Authorization: Bearer <token>
 * 
 * Note: Avec JWT, la déconnexion est principalement côté client
 * (suppression du token). Cette route vérifie simplement la validité
 * du token et peut être étendue pour implémenter une blacklist si nécessaire.
 * 
 * Réponse succès (200):
 * {
 *   "success": true,
 *   "message": "Déconnexion réussie"
 * }
 * 
 * Réponse erreur (401/500):
 * {
 *   "success": false,
 *   "error": "Message d'erreur"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Extraire le token du header Authorization
    const authHeader = request.headers.get('Authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: AUTH_ERRORS.UNAUTHORIZED,
        },
        { status: 401 }
      )
    }

    // 2. Vérifier la validité du token
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: AUTH_ERRORS.TOKEN_INVALID,
        },
        { status: 401 }
      )
    }

    // 3. [OPTIONNEL] Ajouter le token à une blacklist
    // Si vous implémentez une blacklist Redis/DB pour invalider les tokens
    // avant leur expiration naturelle:
    /*
    await redis.setex(
      `blacklist:${token}`,
      60 * 60 * 24 * 7, // TTL = durée de vie du token
      '1'
    )
    */

    // 4. [OPTIONNEL] Logger la déconnexion pour audit
    console.log(`✅ Admin déconnecté: ${payload.email} (ID: ${payload.adminId})`)

    // 5. Retourner la confirmation
    return NextResponse.json(
      {
        success: true,
        message: 'Déconnexion réussie',
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('❌ Erreur lors de la déconnexion:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Une erreur est survenue lors de la déconnexion',
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/auth/logout
 * 
 * Gestion CORS pour les requêtes préliminaires
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}