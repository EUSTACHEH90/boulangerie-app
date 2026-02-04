// app/admin/(dashboard)/commandes/page.tsx

import { cookies } from 'next/headers'
import OrdersTable from '@/components/admin/OrdersTable'
import prisma from '@/lib/db'
import type { Order } from '@/types'

async function getOrders(): Promise<Order[]> {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        payment: true,
      },
    })

    return orders.map((order: any) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      total: Number(order.total),
      isDelivery: order.isDelivery,
      deliveryAddress: order.deliveryAddress,
      deliveryTime: order.deliveryTime ? order.deliveryTime.toISOString() : null,
      notes: order.notes,
      adminNotes: order.adminNotes,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      completedAt: order.completedAt ? order.completedAt.toISOString() : null,
      cancelledAt: order.cancelledAt ? order.cancelledAt.toISOString() : null,
      items: order.items.map((item: any) => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        productName: item.productName,
        price: Number(item.price),
        quantity: item.quantity,
        subtotal: Number(item.subtotal),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.createdAt.toISOString(),
      })),
      payment: order.payment
  ? {
      id: order.payment.id,
      orderId: order.payment.orderId,
      method: order.payment.method as any,
      status: order.payment.status as any,
      amount: Number(order.payment.amount),
      transactionId: order.payment.transactionId,
      transactionRef: order.payment.transactionRef ?? null,
      provider: order.payment.operator,
      phoneNumber: order.payment.phoneNumber,
      operator: order.payment.operator,
      paymentUrl: null,
      failureReason: order.payment.failureReason,
      metadata: order.payment.metadata ?? null,
      createdAt: order.payment.createdAt.toISOString(),
      updatedAt: order.payment.updatedAt.toISOString(),
      completedAt: order.payment.completedAt
        ? order.payment.completedAt.toISOString()
        : null,
    }
  : null,

    }))
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error)
    return []
  }
}

export default async function CommandesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value || ''

  const orders = await getOrders()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des commandes</h1>
          <p className="text-gray-600 mt-1">
            {orders.length} commande(s) au total
          </p>
        </div>
      </div>

      {orders.length > 0 ? (
        <OrdersTable orders={orders} token={token} />
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">Aucune commande pour le moment</p>
          <p className="text-gray-400 text-sm mt-2">
            Les commandes passées sur le site apparaîtront ici
          </p>
        </div>
      )}
    </div>
  )
}