// src/lib/validations/product.ts

import { z } from 'zod'
import { ProductCategory, ProductStatus } from '@prisma/client'

/**
 * Schéma de validation pour la création d'un produit
 */
export const createProductSchema = z.object({
  name: z
    .string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .trim(),

  slug: z
    .string()
    .min(3, 'Le slug doit contenir au moins 3 caractères')
    .max(100, 'Le slug ne peut pas dépasser 100 caractères')
    .regex(/^[a-z0-9-]+$/, 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets')
    .optional(),

  description: z
    .string()
    .max(1000, 'La description ne peut pas dépasser 1000 caractères')
    .optional()
    .nullable(),

  // ✅ Utiliser nativeEnum pour préserver le type
  category: z.nativeEnum(ProductCategory),

  status: z.nativeEnum(ProductStatus).default('AVAILABLE'),

  price: z
    .number()
    .positive('Le prix doit être positif')
    .multipleOf(0.01, 'Le prix doit avoir au maximum 2 décimales'),

  image: z
    .string()
    .url('L\'URL de l\'image est invalide')
    .optional()
    .nullable(),

  images: z
    .array(z.string().url('URL invalide'))
    .max(10, 'Maximum 10 images')
    .default([]),

  weight: z
    .number()
    .int('Le poids doit être un nombre entier')
    .positive('Le poids doit être positif')
    .optional()
    .nullable(),

  isAvailable: z
    .boolean()
    .default(true),

  stock: z
    .number()
    .int('Le stock doit être un nombre entier')
    .nonnegative('Le stock ne peut pas être négatif')
    .optional()
    .nullable(),

  metaTitle: z
    .string()
    .max(60, 'Le titre SEO ne peut pas dépasser 60 caractères')
    .optional()
    .nullable(),

  metaDescription: z
    .string()
    .max(160, 'La description SEO ne peut pas dépasser 160 caractères')
    .optional()
    .nullable(),
})

/**
 * Schéma de validation pour la mise à jour d'un produit
 */
export const updateProductSchema = createProductSchema.partial()

/**
 * Schéma pour les paramètres de requête GET
 * ✅ Correction : Utiliser nativeEnum pour category et status
 */
export const getProductsQuerySchema = z.object({
  category: z.nativeEnum(ProductCategory).optional(),
  
  status: z.nativeEnum(ProductStatus).optional(),
  
  isAvailable: z
    .string()
    .transform(val => val === 'true')
    .optional(),
  
  page: z
    .string()
    .optional()
    .default('1')
    .transform(val => parseInt(val, 10))
    .pipe(z.number().int().positive()),
  
  limit: z
    .string()
    .optional()
    .default('20')
    .transform(val => parseInt(val, 10))
    .pipe(z.number().int().positive().max(100)),
  
  search: z.string().optional(),
})

/**
 * Types inférés depuis les schémas
 */
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type GetProductsQuery = z.infer<typeof getProductsQuerySchema>