// src/lib/services/product.service.ts

import prisma from '@/lib/db'
import { ProductCategory, ProductStatus }  from '@/lib/enums'
import type { CreateProductInput, UpdateProductInput } from '@/lib/validations/product'
import { Prisma } from '@prisma/client'

/**
 * Génère un slug unique à partir du nom du produit
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Vérifie si un slug existe déjà
 */
async function isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
  const existing = await prisma.product.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!existing) return true
  if (excludeId && existing.id === excludeId) return true

  return false
}

/**
 * Génère un slug unique en ajoutant un suffixe si nécessaire
 */
async function generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
  let slug = generateSlug(name)
  let counter = 1

  while (!(await isSlugUnique(slug, excludeId))) {
    slug = `${generateSlug(name)}-${counter}`
    counter++
  }

  return slug
}

// ============================================
// SERVICE LAYER - PRODUITS
// ============================================

export class ProductService {
  /**
   * Récupérer tous les produits avec filtres et pagination
   */
  static async getAll(params: {
    category?: ProductCategory
    status?: ProductStatus
    isAvailable?: boolean
    page?: number
    limit?: number
    search?: string
  }) {
    const {
      category,
      status,
      isAvailable,
      page = 1,
      limit = 20,
      search,
    } = params

    const where: Prisma.ProductWhereInput = {
      ...(category && { category }),
      ...(status && { status }),
      ...(isAvailable !== undefined && { isAvailable }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    }
  }

  /**
   * Récupérer un produit par ID
   */
  static async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      throw new Error('Produit non trouvé')
    }

    return product
  }

  /**
   * Récupérer un produit par slug
   */
  static async getBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
    })

    if (!product) {
      throw new Error('Produit non trouvé')
    }

    return product
  }

  /**
   * Créer un nouveau produit
   */
  static async create(data: CreateProductInput) {
    // Générer un slug unique si non fourni
    const slug = data.slug || (await generateUniqueSlug(data.name))

    // Vérifier l'unicité du slug si fourni
    if (data.slug && !(await isSlugUnique(data.slug))) {
      throw new Error('Ce slug existe déjà')
    }

    // ✅ Correction : Typage explicite pour Prisma
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        category: data.category as ProductCategory, // ✅ Cast explicite
        status: (data.status || 'AVAILABLE') as ProductStatus, // ✅ Cast explicite
        price: new Prisma.Decimal(data.price),
        image: data.image,
        images: data.images || [],
        weight: data.weight,
        isAvailable: data.isAvailable ?? true,
        stock: data.stock,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
      },
    })

    return product
  }

  /**
   * Mettre à jour un produit
   */
  static async update(id: string, data: UpdateProductInput) {
    // Vérifier que le produit existe
    await this.getById(id)

    // Si le nom est modifié, régénérer le slug
    let slug = data.slug
    if (data.name && !data.slug) {
      slug = await generateUniqueSlug(data.name, id)
    }

    // Vérifier l'unicité du slug si fourni
    if (data.slug && !(await isSlugUnique(data.slug, id))) {
      throw new Error('Ce slug existe déjà')
    }

    // ✅ Construire l'objet de mise à jour avec typage explicite
    const updateData: Prisma.ProductUpdateInput = {
      ...(data.name !== undefined && { name: data.name }),
      ...(slug && { slug }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.category && { category: data.category as ProductCategory }),
      ...(data.status && { status: data.status as ProductStatus }),
      ...(data.price !== undefined && { price: new Prisma.Decimal(data.price) }),
      ...(data.image !== undefined && { image: data.image }),
      ...(data.images !== undefined && { images: data.images }),
      ...(data.weight !== undefined && { weight: data.weight }),
      ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
      ...(data.stock !== undefined && { stock: data.stock }),
      ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle }),
      ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription }),
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    })

    return product
  }

  /**
   * Supprimer un produit
   */
  static async delete(id: string) {
    // Vérifier que le produit existe
    await this.getById(id)

    // Vérifier qu'il n'est pas lié à des commandes
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: id },
    })

    if (orderItemsCount > 0) {
      throw new Error(
        'Impossible de supprimer ce produit car il est lié à des commandes. Archivez-le plutôt.'
      )
    }

    await prisma.product.delete({
      where: { id },
    })

    return { success: true }
  }

  /**
   * Archiver un produit (alternative à la suppression)
   */
  static async archive(id: string) {
    return this.update(id, { status: 'ARCHIVED' as ProductStatus, isAvailable: false })
  }
}