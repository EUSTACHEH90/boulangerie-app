// src/lib/services/order.service.ts

import prisma from '@/lib/db'
import { Prisma, OrderStatus, PaymentStatus } from '@prisma/client'
import type { CreateOrderInput, UpdateOrderStatusInput } from '@/lib/validations/order'

/**
 * Génère un numéro de commande unique
 * Format: ORD-YYYYMMDD-XXX
 */
async function generateOrderNumber(): Promise<string> {
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
  
  // Compter les commandes du jour
  const todayStart = new Date(today.setHours(0, 0, 0, 0))
  const todayEnd = new Date(today.setHours(23, 59, 59, 999))
  
  const count = await prisma.order.count({
    where: {
      createdAt: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  })

  const sequence = (count + 1).toString().padStart(3, '0')
  return `ORD-${dateStr}-${sequence}`
}

/**
 * Calcule les montants d'une commande
 */
async function calculateOrderAmounts(
  items: { productId: string; quantity: number }[],
  isDelivery: boolean
) {
  // Récupérer les produits
  const productIds = items.map(item => item.productId)
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      isAvailable: true,
      status: 'AVAILABLE',
    },
    select: { id: true, price: true, name: true, stock: true },
  })

  // Vérifier que tous les produits existent
  if (products.length !== items.length) {
    const foundIds = products.map(p => p.id)
    const missingIds = productIds.filter(id => !foundIds.includes(id))
    throw new Error(`Produits non disponibles: ${missingIds.join(', ')}`)
  }

  // Vérifier le stock
  for (const item of items) {
    const product = products.find(p => p.id === item.productId)!
    if (product.stock !== null && product.stock < item.quantity) {
      throw new Error(`Stock insuffisant pour ${product.name}. Disponible: ${product.stock}`)
    }
  }

  // Calculer le sous-total
  let subtotal = new Prisma.Decimal(0)
  const orderItems: Array<{
    productId: string
    productName: string
    price: Prisma.Decimal
    quantity: number
    subtotal: Prisma.Decimal
  }> = []

  for (const item of items) {
    const product = products.find(p => p.id === item.productId)!
    const price = new Prisma.Decimal(product.price)
    const itemSubtotal = price.mul(item.quantity)
    
    subtotal = subtotal.add(itemSubtotal)
    
    orderItems.push({
      productId: product.id,
      productName: product.name,
      price,
      quantity: item.quantity,
      subtotal: itemSubtotal,
    })
  }

  // Frais de livraison (exemple: 2000 FCFA)
  const deliveryFee = isDelivery ? new Prisma.Decimal(2000) : new Prisma.Decimal(0)
  
  // Total
  const total = subtotal.add(deliveryFee)

  return { orderItems, subtotal, deliveryFee, total }
}

// ============================================
// SERVICE LAYER - COMMANDES
// ============================================

export class OrderService {
  /**
   * Récupérer toutes les commandes avec filtres et pagination
   */
  static async getAll(params: {
    status?: OrderStatus
    customerPhone?: string
    startDate?: Date
    endDate?: Date
    page?: number
    limit?: number
  }) {
    const {
      status,
      customerPhone,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = params

    // Construire les conditions de filtre
    const where: Prisma.OrderWhereInput = {
      ...(status && { status }),
      ...(customerPhone && { customerPhone: { contains: customerPhone } }),
      ...(startDate || endDate ? {
        createdAt: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate }),
        },
      } : {}),
    }

    const skip = (page - 1) * limit

    // Exécuter les requêtes en parallèle
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                  image: true,
                },
              },
            },
          },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return {
      orders,
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
   * Récupérer une commande par ID
   */
  static async getById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                category: true,
                image: true,
              },
            },
          },
        },
        payment: true,
      },
    })

    if (!order) {
      throw new Error('Commande non trouvée')
    }

    return order
  }

  /**
   * Récupérer une commande par numéro
   */
  static async getByOrderNumber(orderNumber: string) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
      },
    })

    if (!order) {
      throw new Error('Commande non trouvée')
    }

    return order
  }

  /**
   * Créer une nouvelle commande
   */
  static async create(data: CreateOrderInput) {
    // Générer le numéro de commande
    const orderNumber = await generateOrderNumber()

    // Calculer les montants
    const { orderItems, subtotal, deliveryFee, total } = 
      await calculateOrderAmounts(data.items, data.isDelivery)

    // Créer la commande avec transaction
    const order = await prisma.$transaction(async (tx) => {
      // Créer la commande
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          status: 'PENDING',
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          subtotal,
          deliveryFee,
          total,
          isDelivery: data.isDelivery,
          deliveryAddress: data.deliveryAddress,
          deliveryTime: data.deliveryTime,
          notes: data.notes,
          items: {
            create: orderItems.map(item => ({
              productId: item.productId,
              productName: item.productName,
              price: item.price,
              quantity: item.quantity,
              subtotal: item.subtotal,
            })),
          },
        },
        include: {
          items: true,
        },
      })

      // Créer le paiement
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          method: data.paymentMethod,
          status: data.paymentMethod === 'CASH' ? 'PENDING' : 'PENDING',
          amount: total,
          phoneNumber: data.phoneNumber,
          operator: data.operator,
        },
      })

      // Décrémenter le stock si défini
      for (const item of orderItems) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true },
        })

        if (product?.stock !== null) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        }
      }

      return newOrder
    })

    return this.getById(order.id)
  }

  /**
   * Mettre à jour le statut d'une commande
   */
  static async updateStatus(id: string, data: UpdateOrderStatusInput) {
    // Vérifier que la commande existe
    const existingOrder = await this.getById(id)

    // Valider la transition de statut
    this.validateStatusTransition(existingOrder.status, data.status)

    // Mettre à jour la commande
    const updateData: Prisma.OrderUpdateInput = {
      status: data.status,
      adminNotes: data.adminNotes,
    }

    // Ajouter les timestamps selon le statut
    if (data.status === 'COMPLETED') {
      updateData.completedAt = new Date()
    } else if (data.status === 'CANCELLED') {
      updateData.cancelledAt = new Date()
      
      // Remettre le stock si annulation
      await this.restoreStock(id)
    }

    await prisma.order.update({
      where: { id },
      data: updateData,
    })

    return this.getById(id)
  }

  /**
   * Valide la transition de statut
   */
  private static validateStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus
  ) {
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PREPARING', 'CANCELLED'],
      PREPARING: ['READY', 'CANCELLED'],
      READY: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
    }

    const allowed = allowedTransitions[currentStatus]
    
    if (!allowed.includes(newStatus)) {
      throw new Error(
        `Transition de statut invalide: ${currentStatus} -> ${newStatus}`
      )
    }
  }

  /**
   * Restaure le stock en cas d'annulation
   */
  private static async restoreStock(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!order) return

    await prisma.$transaction(
      order.items.map(item =>
        prisma.product.updateMany({
          where: {
            id: item.productId,
            stock: { not: null },
          },
          data: {
            stock: { increment: item.quantity },
          },
        })
      )
    )
  }

  /**
   * Obtenir les statistiques des commandes
   */
  static async getStats() {
    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'COMPLETED' } }),
      prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { total: true },
      }),
    ])

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: totalRevenue._sum.total || 0,
    }
  }
}