// src/app/(client)/commande/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CheckCircle,
  Clock,
  Package,
  Truck,
  XCircle,
  RefreshCw,
  Bell,
  BellOff,
  X,
  AlertCircle,
  Info,
} from 'lucide-react'
import type { Order } from '@/types'
import NotificationSystem from '@/components/ui/NotificationSystem'

interface SuiviPageProps {
  params: Promise<{ id: string }>
}

export default function SuiviPage({ params }: SuiviPageProps) {
  const [orderId, setOrderId] = useState<string>('')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  // Récupérer l'ID de la commande
  useEffect(() => {
    params.then(p => setOrderId(p.id))
  }, [params])

  // Récupération de la commande
  const fetchOrder = async (showRefreshIndicator = false) => {
    if (!orderId) return

    if (showRefreshIndicator) setRefreshing(true)

    try {
      const response = await fetch(`/api/commandes/${orderId}`)
      const { data } = await response.json()
      setOrder(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
      if (showRefreshIndicator) setRefreshing(false)
    }
  }

  // Auto-refresh toutes les 30 secondes si la commande n'est pas terminée ou annulée
  useEffect(() => {
    if (!orderId) return
    fetchOrder()

    const interval = setInterval(() => {
      if (order && !['COMPLETED', 'CANCELLED'].includes(order.status)) {
        fetchOrder()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [orderId, order?.status])

  // Demander la permission pour les notifications
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setNotificationsEnabled(true)
        new Notification('🔔 Notifications activées', {
          body: 'Vous recevrez des notifications lors des changements de statut de votre commande.',
          icon: '/favicon.ico',
        })
      }
    }
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price)

  const formatDate = (date: string) =>
    new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const getStatusInfo = (status: string) => {
    const statuses: Record<
      string,
      { icon: any; color: string; bg: string; label: string; message?: string }
    > = {
      PENDING: {
        icon: Clock,
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        label: 'En attente',
        message: 'Votre commande a été reçue et sera confirmée sous peu.',
      },
      CONFIRMED: {
        icon: CheckCircle,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        label: 'Confirmée',
        message: 'Votre commande a été confirmée et va être préparée.',
      },
      PREPARING: {
        icon: Package,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        label: 'En préparation',
        message: 'Nos boulangers préparent votre commande avec soin.',
      },
      READY: {
        icon: Truck,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        label: order?.isDelivery ? 'Prête pour livraison' : 'Prête pour retrait',
        message: order?.isDelivery
          ? 'Votre commande est prête et sera bientôt livrée.'
          : 'Votre commande est prête ! Vous pouvez venir la récupérer.',
      },
      COMPLETED: {
        icon: CheckCircle,
        color: 'text-green-600',
        bg: 'bg-green-50',
        label: 'Terminée',
        message: order?.isDelivery
          ? 'Votre commande a été livrée avec succès !'
          : 'Merci pour votre visite ! À bientôt.',
      },
      CANCELLED: {
        icon: XCircle,
        color: 'text-red-600',
        bg: 'bg-red-50',
        label: 'Annulée',
        message:
          "Cette commande a été annulée. Contactez-nous pour plus d&apos;informations.",
      },
    }
    return statuses[status] || statuses.PENDING
  }

  const getProgressPercentage = (status: string) => {
    const percentages: Record<string, number> = {
      PENDING: 0,
      CONFIRMED: 25,
      PREPARING: 50,
      READY: 75,
      COMPLETED: 100,
      CANCELLED: 0,
    }
    return percentages[status] || 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-red-600 text-lg">Commande non trouvée</p>
          <Link
            href="/"
            className="text-amber-600 hover:underline mt-4 inline-block"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(order.status)
  const StatusIcon = statusInfo.icon
  const progressPercentage = getProgressPercentage(order.status)

  return (
    <>
      {/* Système de notifications */}
      {notificationsEnabled && <NotificationSystem orderId={orderId} />}

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header et actions */}
          <div className="flex justify-between items-center mb-6">
            <Link
              href="/produits"
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              ← Continuer mes achats
            </Link>
            <div className="flex gap-2">
              {!notificationsEnabled && 'Notification' in window && (
                <button
                  onClick={requestNotificationPermission}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
                >
                  <Bell className="w-4 h-4" />
                  Activer les notifications
                </button>
              )}
              {notificationsEnabled && (
                <button
                  onClick={() => setNotificationsEnabled(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  <BellOff className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => fetchOrder(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                />
                Actualiser
              </button>
            </div>
          </div>

          {/* Détails de la commande */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Commande {order.orderNumber}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Passée le {formatDate(order.createdAt)}
                </p>
              </div>
              <div className={`${statusInfo.bg} px-4 py-2 rounded-lg`}>
                <div className="flex items-center gap-2">
                  <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                  <span className={`font-semibold ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Barre de progression */}
            {order.status !== 'CANCELLED' && (
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progression</span>
                  <span className="text-sm font-medium text-amber-600">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="relative mb-6">
              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
                <div
                  className="h-full bg-amber-600 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <div className="relative flex justify-between">
                {['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED'].map((status, index) => {
                  const isActive = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED'].indexOf(order.status) >= index
                  const isCurrent = order.status === status
                  const info = getStatusInfo(status)
                  const Icon = info.icon

                  return (
                    <div key={status} className="flex flex-col items-center relative z-10">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isCurrent ? `${info.bg} ring-4 ring-amber-200` : isActive ? info.bg : 'bg-gray-200'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? info.color : 'text-gray-400'}`} />
                      </div>
                      <span className={`text-xs mt-2 text-center max-w-[80px] ${isActive ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                        {info.label.split(' ')[0]}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Articles */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Articles commandés</h2>
            <div className="space-y-4">
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between border-b pb-4 last:border-b-0">
                  <div className="flex gap-4">
                    {item.product?.image && (
                      <img
                        src={item.product.image}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                      <p className="text-sm font-semibold text-amber-600">
                        {formatPrice(Number(item.price))} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900">{formatPrice(Number(item.subtotal))}</p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span>{formatPrice(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Livraison</span>
                <span>{formatPrice(Number(order.deliveryFee))}</span>
              </div>
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-amber-600">{formatPrice(Number(order.total))}</span>
              </div>
            </div>
          </div>

          {/* Infos client et livraison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-4">Informations client</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-500">Nom:</span> <span className="font-medium">{order.customerName}</span>
                </p>
                <p>
                  <span className="text-gray-500">Téléphone:</span> <span className="font-medium">{order.customerPhone}</span>
                </p>
                {order.customerEmail && (
                  <p>
                    <span className="text-gray-500">Email:</span> <span className="font-medium">{order.customerEmail}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-4">{order.isDelivery ? 'Livraison' : 'Retrait'}</h3>
              <div className="space-y-2 text-sm">
                {order.isDelivery ? (
                  <>
                    <p>
                      <span className="text-gray-500">Adresse:</span> <span className="font-medium">{order.deliveryAddress}</span>
                    </p>
                    {order.deliveryTime && (
                      <p>
                        <span className="text-gray-500">Heure souhaitée:</span>{' '}
                        <span className="font-medium">{new Date(order.deliveryTime).toLocaleString('fr-FR')}</span>
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-600">
                    Votre commande sera disponible pour retrait en boutique dès qu&apos;elle sera prête.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Paiement */}
          {order.payment && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="font-bold text-gray-900 mb-4">Paiement</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-500">Méthode:</span>{' '}
                  <span className="font-medium">
                    {order.payment.method === 'MOBILE_MONEY' ? 'Mobile Money' : 'Espèces'}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">Statut:</span>{' '}
                  <span
                    className={`font-medium ${
                      order.payment.status === 'COMPLETED'
                        ? 'text-green-600'
                        : order.payment.status === 'PROCESSING'
                        ? 'text-orange-600'
                        : order.payment.status === 'FAILED'
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {order.payment.status === 'COMPLETED'
                      ? 'Payé'
                      : order.payment.status === 'PROCESSING'
                      ? 'En cours'
                      : order.payment.status === 'FAILED'
                      ? 'Échec'
                      : 'En attente'}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Bouton Continuer mes achats */}
          <div className="flex gap-4">
            <Link
              href="/produits"
              className="flex-1 bg-amber-600 text-white text-center px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition"
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
