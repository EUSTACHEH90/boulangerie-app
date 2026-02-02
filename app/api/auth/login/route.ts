// src/app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import {
  verifyPassword,
  generateToken,
  sanitizeAdmin,
  isValidEmail,
  AUTH_ERRORS,
} from '@/lib/auth'

/**
 * POST /api/auth/login
 * 
 * Authentifie un administrateur et retourne un token JWT
 * 
 * Body attendu:
 * {
 *   "email": "admin@bakery.com",
 *   "password": "Admin@123"
 * }
 * 
 * Réponse succès (200):
 * {
 *   "success": true,
 *   "data": {
 *     "admin": { id, email, firstName, lastName, role, ... },
 *     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *   },
 *   "message": "Connexion réussie"
 * }
 * 
 * Réponse erreur (400/401/403/500):
 * {
 *   "success": false,
 *   "error": "Message d'erreur"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parser le body de la requête
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

    const { email, password } = body

    // 2. Validation des champs requis
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email et mot de passe requis',
        },
        { status: 400 }
      )
    }

    // 3. Validation du format email
    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          error: AUTH_ERRORS.INVALID_EMAIL,
        },
        { status: 400 }
      )
    }

    // 4. Rechercher l'admin en base de données
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    // 5. Vérifier l'existence (message générique pour la sécurité)
    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          error: AUTH_ERRORS.INVALID_CREDENTIALS,
        },
        { status: 401 }
      )
    }

    // 6. Vérifier si le compte est actif
    if (!admin.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: AUTH_ERRORS.ACCOUNT_INACTIVE,
        },
        { status: 403 }
      )
    }

    // 7. Vérifier le mot de passe
    const isPasswordValid = await verifyPassword(password, admin.password)

    if (!isPasswordValid) {
      // Attendre un peu pour ralentir les attaques par force brute
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return NextResponse.json(
        {
          success: false,
          error: AUTH_ERRORS.INVALID_CREDENTIALS,
        },
        { status: 401 }
      )
    }

    // 8. Mettre à jour la date de dernière connexion
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    })

    // 9. Générer le token JWT
    const token = generateToken(admin)

    // 10. Retourner la réponse avec les données sanitizées
    return NextResponse.json(
      {
        success: true,
        data: {
          admin: sanitizeAdmin(admin),
          token,
        },
        message: 'Connexion réussie',
      },
      { status: 200 }
    )

  } catch (error) {
    // Log l'erreur côté serveur (à envoyer vers un service de monitoring en prod)
    console.error('❌ Erreur lors de la connexion:', error)

    // Ne jamais exposer les détails de l'erreur au client
    return NextResponse.json(
      {
        success: false,
        error: 'Une erreur est survenue lors de la connexion',
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/auth/login
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