// src/lib/auth.ts

import bcrypt from 'bcryptjs'
import jwt, { SignOptions } from 'jsonwebtoken'
import { Admin } from '@prisma/client'

/**
 * Configuration JWT
 * ⚠️ En production, utilisez des secrets complexes et stockez-les dans .env
 */
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as '7d' // Type littéral

/**
 * Nombre de rounds pour bcrypt
 * Plus élevé = plus sécurisé mais plus lent
 * 10-12 recommandé pour la production
 */
const SALT_ROUNDS = 10

// ============================================
// TYPES
// ============================================

/**
 * Payload du JWT
 * Contient uniquement les informations nécessaires (principe du moindre privilège)
 */
export interface JWTPayload {
  adminId: string
  email: string
  role: string
  iat?: number
  exp?: number
  iss?: string
  aud?: string
}

/**
 * Données retournées après une authentification réussie
 */
export interface AuthResponse {
  admin: Omit<Admin, 'password'> // Admin sans le mot de passe
  token: string
}

// ============================================
// HASH & VÉRIFICATION DU MOT DE PASSE
// ============================================

/**
 * Hash un mot de passe avec bcrypt
 * 
 * @param password - Mot de passe en clair
 * @returns Mot de passe hashé
 * 
 * @example
 * const hashedPassword = await hashPassword('MySecurePassword123')
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS)
    const hash = await bcrypt.hash(password, salt)
    return hash
  } catch (error) {
    console.error('Erreur lors du hashage du mot de passe:', error)
    throw new Error('Impossible de sécuriser le mot de passe')
  }
}

/**
 * Vérifie si un mot de passe correspond au hash
 * 
 * @param password - Mot de passe en clair à vérifier
 * @param hash - Hash stocké en base de données
 * @returns true si le mot de passe correspond, false sinon
 * 
 * @example
 * const isValid = await verifyPassword('MyPassword123', admin.password)
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash)
  } catch (error) {
    console.error('Erreur lors de la vérification du mot de passe:', error)
    return false
  }
}

// ============================================
// JWT - GÉNÉRATION & VÉRIFICATION
// ============================================

/**
 * Génère un token JWT pour un admin
 * 
 * @param admin - Objet Admin de Prisma
 * @returns Token JWT signé
 * 
 * @example
 * const token = generateToken(admin)
 */
export function generateToken(admin: Admin): string {
  const payload = {
    adminId: admin.id,
    email: admin.email,
    role: admin.role,
  }

  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'bakery-api',
      audience: 'bakery-admin',
    })
  } catch (error) {
    console.error('Erreur lors de la génération du token:', error)
    throw new Error('Impossible de générer le token d\'authentification')
  }
}

/**
 * Vérifie et décode un token JWT
 * 
 * @param token - Token JWT à vérifier
 * @returns Payload du token si valide, null sinon
 * 
 * @example
 * const payload = verifyToken(token)
 * if (payload) {
 *   console.log('Admin ID:', payload.adminId)
 * }
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'bakery-api',
      audience: 'bakery-admin',
    }) as JWTPayload

    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.warn('Token expiré')
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.warn('Token invalide')
    } else {
      console.error('Erreur lors de la vérification du token:', error)
    }
    return null
  }
}

// ============================================
// HELPERS
// ============================================

/**
 * Extrait le token JWT depuis le header Authorization
 * 
 * @param authHeader - Header Authorization (format: "Bearer <token>")
 * @returns Token JWT ou null
 * 
 * @example
 * const token = extractTokenFromHeader(request.headers.get('Authorization'))
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null

  const parts = authHeader.split(' ')
  
  // Format attendu: "Bearer <token>"
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null
  }

  return parts[1]
}

/**
 * Retire le mot de passe d'un objet Admin
 * Utilisé pour ne jamais exposer le hash du mot de passe
 * 
 * @param admin - Objet Admin complet
 * @returns Admin sans le champ password
 */
export function sanitizeAdmin(admin: Admin): Omit<Admin, 'password'> {
  const { password, ...sanitized } = admin
  return sanitized
}

/**
 * Valide le format d'un email
 * 
 * @param email - Email à valider
 * @returns true si l'email est valide
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valide la force d'un mot de passe
 * Critères:
 * - Au moins 8 caractères
 * - Au moins 1 majuscule
 * - Au moins 1 minuscule
 * - Au moins 1 chiffre
 * 
 * @param password - Mot de passe à valider
 * @returns true si le mot de passe est suffisamment fort
 */
export function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false

  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  return hasUpperCase && hasLowerCase && hasNumber
}

// ============================================
// CONSTANTES POUR LES ERREURS
// ============================================

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
  INVALID_EMAIL: 'Format d\'email invalide',
  WEAK_PASSWORD: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre',
  TOKEN_EXPIRED: 'Session expirée, veuillez vous reconnecter',
  TOKEN_INVALID: 'Token d\'authentification invalide',
  UNAUTHORIZED: 'Accès non autorisé',
  ACCOUNT_INACTIVE: 'Ce compte a été désactivé',
} as const