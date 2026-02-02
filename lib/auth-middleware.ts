// src/lib/auth-middleware.ts

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader, AUTH_ERRORS } from '@/lib/auth'
import type { JWTPayload } from '@/lib/auth'

/**
 * Type pour les requêtes authentifiées
 * Ajoute le payload JWT à l'objet request
 */
export interface AuthenticatedRequest extends NextRequest {
  admin?: JWTPayload
}

/**
 * Type de retour pour requireAuth
 */
export type AuthResult =
  | { admin: JWTPayload; error: null; response?: never }
  | { admin: null; error: true; response: NextResponse }

/**
 * Middleware réutilisable pour protéger les routes API
 * 
 * Usage:
 * export async function GET(request: NextRequest) {
 *   const authResult = await requireAuth(request)
 *   if (authResult.error) return authResult.response
 *   
 *   const admin = authResult.admin
 *   // ... votre logique
 * }
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get('Authorization')
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    return {
      admin: null,
      error: true,
      response: NextResponse.json(
        {
          success: false,
          error: AUTH_ERRORS.UNAUTHORIZED,
        },
        { status: 401 }
      ),
    }
  }

  const payload = verifyToken(token)

  if (!payload) {
    return {
      admin: null,
      error: true,
      response: NextResponse.json(
        {
          success: false,
          error: AUTH_ERRORS.TOKEN_INVALID,
        },
        { status: 401 }
      ),
    }
  }

  return {
    admin: payload,
    error: null,
  }
}

/**
 * Vérifie si l'admin a un rôle spécifique
 */
export function requireRole(
  admin: JWTPayload,
  role: 'ADMIN' | 'SUPER_ADMIN'
): boolean {
  return admin.role === role || admin.role === 'SUPER_ADMIN'
}