// app/(clients)/commande/[id]/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const STATUS_STEPS = [
  {
    key: 'PENDING',
    label: 'Commande reçue',
    description: 'Votre commande a été reçue et est en attente de confirmation',
    icon: '📋',
    color: 'bg-yellow-500',
  },
  {
    key: 'CONFIRMED',
    label: 'Confirmée',
    description: 'Votre commande a été confirmée par notre équipe',
    icon: '✅',
    color: 'bg-blue-500',
  },
  {
    key: 'PREPARING',
    label: 'En préparation',
    description: 'Nos boulangers préparent votre commande avec soin',
    icon: '👨‍🍳',
    color: 'bg-orange-500',
  },
  {
    key: 'READY',
    label: 'Prête',
    description: 'Votre commande est prête !',
    icon: '🎉',
    color: 'bg-green-500',
  },
  {
    key: 'COMPLETED',
    label: 'Livrée',
    description: 'Votre commande a été livrée. Bon appétit !',
    icon: '🥖',
    color: 'bg-green-700',
  },
]

interface OrderItem {
  id: string
  orderId: string
  productId: string
  productName: string
  quantity: number
  price: number
  subtotal: number
  createdAt: string
  updatedAt: string
}

interface Payment {
  id: string
  orderId: string
  method: string
  status: string
  amount: number
  transactionId: string | null
  transactionRef: string | null
  provider: string | null
  phoneNumber: string | null
  operator: string | null
  paymentUrl: string | null
  metadata: any
  failureReason: string | null
  createdAt: string
  updatedAt: string
  completedAt: string | null
}

interface OrderData {
  id: string
  orderNumber: string
  status: string
  customerName: string
  customerPhone: string
  customerEmail: string | null
  subtotal: number
  deliveryFee: number
  total: number
  isDelivery: boolean
  deliveryAddress: string | null
  deliveryTime: string | null
  notes: string | null
  adminNotes: string | null
  completedAt: string | null
  cancelledAt: string | null
  items: OrderItem[]
  payment: Payment | null
  createdAt: string
  updatedAt: string
}

export default function SuiviCommandePage() {
  const params = useParams()
  const id = params.id as string

  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchOrder = useCallback(async () => {
    try {
      const response = await fetch(`/api/commandes/${id}`)
      if (!response.ok) throw new Error('Commande non trouvée')
      const data = await response.json()
      setOrder(data.data)
      setLastUpdated(new Date())
    } catch (err) {
      setError('Commande non trouvée')
    } finally {
      setLoading(false)
    }
  }, [id])

  // ✅ Polling toutes les 30 secondes
  useEffect(() => {
    fetchOrder()
    const interval = setInterval(fetchOrder, 30000)
    return () => clearInterval(interval)
  }, [fetchOrder])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      CASH: '💵 Espèces',
      MOBILE_MONEY: '📱 Mobile Money',
      CARD: '💳 Carte bancaire',
    }
    return labels[method] || method
  }

  const getPaymentStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: '⏳ En attente',
      PROCESSING: '🔄 En cours',
      COMPLETED: '✅ Payé',
      FAILED: '❌ Échoué',
    }
    return labels[status] || status
  }

  const getCurrentStepIndex = () => {
    if (!order) return 0
    if (order.status === 'CANCELLED') return -1
    return STATUS_STEPS.findIndex(s => s.key === order.status)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre commande...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-red-600 text-xl mb-4">❌ {error || 'Commande non trouvée'}</p>
          <Link href="/" className="text-amber-600 hover:underline">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  const currentStepIndex = getCurrentStepIndex()
  const isCancelled = order.status === 'CANCELLED'

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4 sm:space-y-6">

        {/* Header commande */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Suivi de commande
              </h1>
              <p className="text-amber-600 font-semibold mt-1">
                {order.orderNumber}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Bonjour {order.customerName} 👋
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs text-gray-400">
                Dernière mise à jour
              </p>
              <p className="text-sm text-gray-600 font-medium">
                {lastUpdated.toLocaleTimeString('fr-FR')}
              </p>
              <button
                onClick={fetchOrder}
                className="mt-1 text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 sm:ml-auto"
              >
                🔄 Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* Statut annulé */}
        {isCancelled && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="text-3xl flex-shrink-0">❌</span>
              <div>
                <h2 className="text-lg font-bold text-red-800">
                  Commande annulée
                </h2>
                <p className="text-red-600 text-sm mt-1">
                  Votre commande a été annulée.
                </p>
                {order.adminNotes && (
                  <p className="text-red-700 text-sm mt-2 bg-red-100 p-2 rounded">
                    Note : {order.adminNotes}
                  </p>
                )}
                
                <a href="tel:+22670123456"
                  className="inline-block mt-3 text-sm text-red-700 font-medium underline"
                >
                  Contactez-nous pour plus d'informations
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Progression */}
        {!isCancelled && (
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Progression
            </h2>

            <div className="relative">
              {/* Ligne verticale de fond */}
              <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200 z-0"></div>

              {/* Ligne de progression dynamique */}
              <div
                className="absolute left-5 top-5 w-0.5 bg-amber-500 transition-all duration-700 z-0"
                style={{
                  height: currentStepIndex >= 0
                    ? `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 90}%`
                    : '0%'
                }}
              />

              <div className="space-y-4 sm:space-y-6 relative z-10">
                {STATUS_STEPS.map((step, index) => {
                  const isCompleted = index < currentStepIndex
                  const isCurrent = index === currentStepIndex
                  const isPending = index > currentStepIndex

                  return (
                    <div key={step.key} className="flex items-start gap-3 sm:gap-4">
                      {/* Icône étape */}
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        text-base flex-shrink-0 transition-all duration-500 border-2
                        ${isCompleted
                          ? 'bg-green-500 border-green-500 text-white shadow-md'
                          : isCurrent
                          ? `${step.color} border-transparent text-white shadow-lg ring-4 ring-amber-100`
                          : 'bg-white border-gray-200 text-gray-300'
                        }
                      `}>
                        {isCompleted ? '✓' : step.icon}
                      </div>

                      {/* Contenu étape */}
                      <div className={`flex-1 pt-1.5 transition-all duration-500 ${
                        isPending ? 'opacity-40' : ''
                      }`}>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`font-semibold text-sm sm:text-base ${
                            isCurrent
                              ? 'text-amber-600'
                              : isCompleted
                              ? 'text-green-600'
                              : 'text-gray-400'
                          }`}>
                            {step.label}
                          </span>

                          {isCurrent && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium animate-pulse">
                              En cours
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                              ✓ Fait
                            </span>
                          )}
                        </div>

                        {(isCurrent || isCompleted) && (
                          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                            {step.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Note admin si présente */}
            {order.adminNotes && !isCancelled && (
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-amber-700 mb-1">
                  Message de notre équipe :
                </p>
                <p className="text-sm text-amber-800">{order.adminNotes}</p>
              </div>
            )}
          </div>
        )}

        {/* Détails commande */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Détails de la commande
          </h2>

          {/* Articles */}
          <div className="space-y-2 mb-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.quantity}× {item.productName}
                </span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(item.subtotal)}
                </span>
              </div>
            ))}
          </div>

          {/* Totaux */}
          <div className="border-t border-gray-100 pt-3 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Sous-total</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Frais de livraison</span>
              <span>{formatPrice(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2">
              <span className="text-gray-900">Total</span>
              <span className="text-amber-600">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Infos livraison et paiement */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Informations
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Mode de récupération</span>
              <span className="font-medium text-gray-900">
                {order.isDelivery ? '🚚 Livraison à domicile' : '🏪 Retrait en boutique'}
              </span>
            </div>

            {order.isDelivery && order.deliveryAddress && (
              <div className="flex justify-between text-sm gap-4">
                <span className="text-gray-500 flex-shrink-0">Adresse</span>
                <span className="font-medium text-gray-900 text-right">
                  {order.deliveryAddress}
                </span>
              </div>
            )}

            {order.deliveryTime && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Heure souhaitée</span>
                <span className="font-medium text-gray-900">
                  {new Date(order.deliveryTime).toLocaleString('fr-FR')}
                </span>
              </div>
            )}

            {order.payment && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Paiement</span>
                  <span className="font-medium text-gray-900">
                    {getPaymentMethodLabel(order.payment.method)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Statut paiement</span>
                  <span className="font-medium text-gray-900">
                    {getPaymentStatusLabel(order.payment.status)}
                  </span>
                </div>
                {order.payment.operator && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Opérateur</span>
                    <span className="font-medium text-gray-900">
                      {order.payment.operator}
                    </span>
                  </div>
                )}
              </>
            )}

            {order.notes && (
              <div className="flex justify-between text-sm gap-4">
                <span className="text-gray-500 flex-shrink-0">Vos notes</span>
                <span className="font-medium text-gray-900 text-right">
                  {order.notes}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-6 text-center">
          <p className="text-amber-800 font-medium mb-3 text-sm sm:text-base">
            Une question sur votre commande ?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            
            <a href="tel:+22670123456"
              className="inline-block bg-amber-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-amber-700 transition text-sm"
            >
              📞 Nous appeler
            </a>
            <Link
              href="/produits"
              className="inline-block bg-white text-amber-600 border border-amber-300 px-6 py-2.5 rounded-lg font-semibold hover:bg-amber-50 transition text-sm"
            >
              🥖 Continuer mes achats
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}