// src/app/admin/(dashboard)/commandes/[id]/page.tsx

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import prisma from '@/lib/db'
import OrderDetailAdmin from '@/components/admin/OrderDetailAdmin'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

async function getOrder(id: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        payment: true,
      },
    })

    if (!order) return null

    return {
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
      items: order.items.map(item => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        productName: item.productName,
        price: Number(item.price),
        quantity: item.quantity,
        subtotal: Number(item.subtotal),
        createdAt: item.createdAt.toISOString(),
      })),
      payment: order.payment ? {
        id: order.payment.id,
        orderId: order.payment.orderId,
        method: order.payment.method,
        status: order.payment.status,
        amount: Number(order.payment.amount),
        phoneNumber: order.payment.phoneNumber,
        operator: order.payment.operator,
        transactionId: order.payment.transactionId,
        transactionRef: order.payment.transactionRef,
        metadata: order.payment.metadata,
        failureReason: order.payment.failureReason,
        createdAt: order.payment.createdAt.toISOString(),
        updatedAt: order.payment.updatedAt.toISOString(),
        completedAt: order.payment.completedAt ? order.payment.completedAt.toISOString() : null,
      } : null,
    }
  } catch (error) {
    console.error('Erreur récupération commande:', error)
    return null
  }
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  const order = await getOrder(id)

  if (!order) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href="/admin/commandes"
          className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux commandes
        </Link>
      </div>

      <OrderDetailAdmin order={order} />
    </div>
  )
}