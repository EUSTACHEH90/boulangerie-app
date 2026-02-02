// src/lib/api/products.ts

import { ProductCategory, ProductStatus } from '@prisma/client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  category: ProductCategory
  status: ProductStatus
  price: number
  image: string | null
  images: string[]
  weight: number | null
  isAvailable: boolean
  stock: number | null
  metaTitle: string | null
  metaDescription: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateProductData {
  name: string
  description?: string | null
  category: ProductCategory
  status?: ProductStatus
  price: number
  image?: string | null
  images?: string[]
  weight?: number | null
  isAvailable?: boolean
  stock?: number | null
  metaTitle?: string | null
  metaDescription?: string | null
}

export type UpdateProductData = Partial<CreateProductData>

/**
 * Récupère tous les produits
 */
export async function getProducts(params?: {
  category?: ProductCategory
  status?: ProductStatus
  isAvailable?: boolean
  page?: number
  limit?: number
  search?: string
}) {
  const queryParams = new URLSearchParams()
  if (params?.category) queryParams.append('category', params.category)
  if (params?.status) queryParams.append('status', params.status)
  if (params?.isAvailable !== undefined) queryParams.append('isAvailable', String(params.isAvailable))
  if (params?.page) queryParams.append('page', String(params.page))
  if (params?.limit) queryParams.append('limit', String(params.limit))
  if (params?.search) queryParams.append('search', params.search)

  const response = await fetch(`${API_URL}/api/produits?${queryParams}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des produits')
  }

  return response.json()
}

/**
 * Récupère un produit par ID
 */
export async function getProductById(id: string) {
  const response = await fetch(`${API_URL}/api/produits/${id}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Produit non trouvé')
  }

  return response.json()
}

/**
 * Crée un nouveau produit
 */
export async function createProduct(data: CreateProductData, token: string) {
  const response = await fetch(`${API_URL}/api/produits`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erreur lors de la création du produit')
  }

  return response.json()
}

/**
 * Met à jour un produit
 */
export async function updateProduct(id: string, data: UpdateProductData, token: string) {
  const response = await fetch(`${API_URL}/api/produits/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erreur lors de la mise à jour du produit')
  }

  return response.json()
}

/**
 * Supprime un produit
 */
export async function deleteProduct(id: string, token: string) {
  const response = await fetch(`${API_URL}/api/produits/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erreur lors de la suppression du produit')
  }

  return response.json()
}