// src/lib/validations/order.ts

import { z } from 'zod'
import { OrderStatus, PaymentMethod } from '@prisma/client'

/**
 * Schéma pour un item de commande
 */
export const orderItemSchema = z.object({
  productId: z.string().uuid('ID produit invalide'),
  quantity: z.number().int().positive('La quantité doit être positive'),
})

/**
 * Schéma de validation pour la création d'une commande
 */
export const createOrderSchema = z.object({
  customerName: z
    .string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .trim(),

  customerEmail: z
    .string()
    .email('Email invalide')
    .optional()
    .nullable(),

  customerPhone: z
    .string()
    .min(8, 'Le numéro de téléphone doit contenir au moins 8 caractères')
    .max(20, 'Le numéro de téléphone ne peut pas dépasser 20 caractères')
    .trim(),

  items: z
    .array(orderItemSchema)
    .min(1, 'La commande doit contenir au moins un article'),

  isDelivery: z.boolean().default(false),

  deliveryAddress: z
    .string()
    .max(500, 'L\'adresse ne peut pas dépasser 500 caractères')
    .optional()
    .nullable(),

  deliveryTime: z
    .string()
    .datetime('Format de date invalide')
    .optional()
    .nullable()
    .transform(val => val ? new Date(val) : null),

  notes: z
    .string()
    .max(1000, 'Les notes ne peuvent pas dépasser 1000 caractères')
    .optional()
    .nullable(),

  paymentMethod: z.nativeEnum(PaymentMethod),
  
  phoneNumber: z
    .string()
    .optional()
    .nullable(),

  operator: z
    .string()
    .optional()
    .nullable(),
})

/**
 * Schéma pour la mise à jour du statut d'une commande
 */
export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  adminNotes: z
    .string()
    .max(1000, 'Les notes admin ne peuvent pas dépasser 1000 caractères')
    .optional()
    .nullable(),
})

/**
 * Schéma pour les paramètres de requête GET
 * ✅ Correction : Utiliser nativeEnum directement
 */
export const getOrdersQuerySchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  
  customerPhone: z.string().optional(),
  
  startDate: z
    .string()
    .datetime()
    .transform(val => new Date(val))
    .optional(),
  
  endDate: z
    .string()
    .datetime()
    .transform(val => new Date(val))
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
})

/**
 * Types inférés depuis les schémas
 */
export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type GetOrdersQuery = z.infer<typeof getOrdersQuerySchema>
export type OrderItemInput = z.infer<typeof orderItemSchema>