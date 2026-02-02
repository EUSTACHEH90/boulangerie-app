// src/components/admin/OrdersTable.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Order } from '@/types'
import Link from 'next/link'


interface OrdersTableProps {
  orders: Order[]
  token: string
}

export default function OrdersTable({ orders, token }: OrdersTableProps) {
  const router = useRouter()
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // ✅ Utiliser ReactNode au lieu de JSX.Element
  const getStatusBadge = (status: string): React.ReactNode => {
    const badges: Record<string, React.ReactNode> = {
      PENDING: <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">En attente</span>,
      CONFIRMED: <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Confirmée</span>,
      PREPARING: <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">En préparation</span>,
      READY: <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Prête</span>,
      COMPLETED: <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Terminée</span>,
      CANCELLED: <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Annulée</span>,
    }
    return badges[status] || null
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    if (!confirm(`Changer le statut de cette commande ?`)) {
      return
    }

    setUpdatingId(orderId)
    try {
      const response = await fetch(`/api/commandes/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour')
      }

      router.refresh()
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      }
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                N° Commande
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {order.customerName}
                    </div>
                    <div className="text-sm text-gray-500">{order.customerPhone}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {formatPrice(Number(order.total))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(order.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/commandes/${order.id}`}
                      className="text-amber-600 hover:text-amber-900"
                    >
                      Voir
                    </Link>
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'CONFIRMED')}
                        disabled={updatingId === order.id}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      >
                        Confirmer
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucune commande trouvée</p>
        </div>
      )}
    </div>
  )
}