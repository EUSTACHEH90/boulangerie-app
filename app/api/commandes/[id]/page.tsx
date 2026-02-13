// app/(clients)/commande/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Printer, Share2, ArrowLeft } from 'lucide-react'

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
  productName: string
  quantity: number
  price: number
  subtotal: number
  product: {
    id: string
    name: string
    slug: string
    category: string
    image: string | null
  } | null
}

interface OrderData {
  id: string
  orderNumber: string
  status: string
  customerName: string
  customerPhone: string
  customerEmail: string | null
  total: number
  subtotal: number
  deliveryFee: number
  isDelivery: boolean
  deliveryAddress: string | null
  deliveryTime: string | null
  notes: string | null
  items: OrderItem[]
  payment: {
    method: string
    status: string
    amount: number
  } | null
  createdAt: string
  adminNotes: string | null
}

export default function SuiviCommandePage() {
  const params = useParams()
  const id = params.id as string

  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [shareCopied, setShareCopied] = useState(false)

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/commandes/${id}`)
      if (!response.ok) throw new Error('Commande non trouvée')
      const data = await response.json()
      setOrder(data.data)
      setLastUpdated(new Date())
    } catch {
      setError('Commande non trouvée')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Polling toutes les 30 secondes
  useEffect(() => {
    fetchOrder()
    const interval = setInterval(fetchOrder, 30000)
    return () => clearInterval(interval)
  }, [id])

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price)

  const getCurrentStepIndex = () => {
    if (!order) return 0
    if (order.status === 'CANCELLED') return -1
    return STATUS_STEPS.findIndex(s => s.key === order.status)
  }

  const handlePrint = () => window.print()

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({
        title: `Commande ${order?.orderNumber}`,
        text: `Suivez ma commande : ${order?.orderNumber}`,
        url,
      })
    } else {
      await navigator.clipboard.writeText(url)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    }
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
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">❌ Commande non trouvée</p>
          <Link href="/mes-commandes" className="text-amber-600 hover:underline">
            Rechercher ma commande
          </Link>
        </div>
      </div>
    )
  }

  const currentStepIndex = getCurrentStepIndex()
  const isCancelled = order.status === 'CANCELLED'
  const isCompleted = order.status === 'COMPLETED'

  return (
    <>
      {/* Style impression */}
      <style jsx global>{`
        @media print {
          header, footer, .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          {/* Retour */}
          <Link
            href="/mes-commandes"
            className="no-print inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 mb-4 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Mes commandes
          </Link>

          {/* Header */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Suivi de commande
                </h1>
                <p className="text-amber-600 font-bold text-base sm:text-lg mt-1 tracking-wider">
                  {order.orderNumber}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 no-print">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Imprimer</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3 py-2 border border-amber-300 rounded-lg text-xs sm:text-sm text-amber-600 hover:bg-amber-50 transition"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {shareCopied ? '✅ Copié !' : 'Partager'}
                  </span>
                </button>
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-gray-400">
                    Màj : {lastUpdated.toLocaleTimeString('fr-FR')}
                  </p>
                  <button
                    onClick={fetchOrder}
                    className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                  >
                    🔄 Actualiser
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Statut annulé */}
          {isCancelled && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">❌</span>
                <div>
                  <h2 className="text-lg font-bold text-red-800">Commande annulée</h2>
                  <p className="text-red-600 text-sm mt-1">
                    Votre commande a été annulée.
                    {order.adminNotes && ` Raison : ${order.adminNotes}`}
                  </p>
                  
                    <a href="tel:+22670123456"
                    className="inline-block mt-2 text-sm text-red-700 underline font-medium"
                  >
                    📞 Contactez-nous
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Statut complété */}
          {isCompleted && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎉</span>
                <div>
                  <h2 className="text-lg font-bold text-green-800">
                    Commande livrée !
                  </h2>
                  <p className="text-green-600 text-sm mt-1">
                    Merci pour votre confiance. Bon appétit ! 🥖
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Progression */}
          {!isCancelled && (
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                Progression
              </h2>
              <div className="relative">
                {/* Ligne fond */}
                <div className="absolute left-5 sm:left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                {/* Ligne progression */}
                <div
                  className="absolute left-5 sm:left-6 top-0 w-0.5 bg-amber-500 transition-all duration-700"
                  style={{
                    height: currentStepIndex >= 0
                      ? `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%`
                      : '0%'
                  }}
                ></div>

                <div className="space-y-4 sm:space-y-6">
                  {STATUS_STEPS.map((step, index) => {
                    const isCompleted = index < currentStepIndex
                    const isCurrent = index === currentStepIndex
                    const isPending = index > currentStepIndex

                    return (
                      <div key={step.key} className="flex items-start gap-3 sm:gap-4 relative">
                        {/* Icône */}
                        <div className={`
                          relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full
                          flex items-center justify-center text-base sm:text-xl
                          flex-shrink-0 transition-all duration-500
                          ${isCompleted ? 'bg-green-500 text-white shadow-md' : ''}
                          ${isCurrent ? `${step.color} text-white shadow-lg ring-4 ring-amber-200 animate-pulse` : ''}
                          ${isPending ? 'bg-gray-200 text-gray-400' : ''}
                        `}>
                          {isCompleted ? '✓' : step.icon}
                        </div>

                        {/* Contenu */}
                        <div className={`flex-1 pb-4 sm:pb-6 transition-all duration-500 ${
                          isPending ? 'opacity-40' : ''
                        }`}>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className={`font-semibold text-sm sm:text-base ${
                              isCurrent ? 'text-amber-600' :
                              isCompleted ? 'text-green-600' :
                              'text-gray-400'
                            }`}>
                              {step.label}
                            </h3>
                            {isCurrent && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
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
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">
                              {step.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Note admin */}
              {order.adminNotes && !isCancelled && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700 font-medium">
                    💬 Message de notre équipe :
                  </p>
                  <p className="text-sm text-blue-600 mt-1">{order.adminNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* Détails commande */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Détails de la commande
            </h2>

            {/* Infos client */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="font-semibold text-gray-900 text-sm">{order.customerName}</p>
              <p className="text-gray-600 text-xs mt-0.5">{order.customerPhone}</p>
              {order.customerEmail && (
                <p className="text-gray-600 text-xs">{order.customerEmail}</p>
              )}
            </div>

            {/* Articles */}
            <div className="space-y-3 mb-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  {/* Image produit */}
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product?.image ? (
                      <Image
                        src={item.product.image}
                        alt={item.productName}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">
                        {item.product?.category === 'BOULANGERIE' ? '🥖' :
                         item.product?.category === 'VIENNOISERIE' ? '🥐' : '🍰'}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.productName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>

                  <p className="font-semibold text-gray-900 text-sm flex-shrink-0">
                    {formatPrice(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totaux */}
            <div className="border-t pt-3 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Sous-total</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Livraison</span>
                <span>{order.deliveryFee > 0 ? formatPrice(order.deliveryFee) : 'Gratuit'}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span className="text-gray-900">Total</span>
                <span className="text-amber-600">{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Infos livraison */}
            <div className="mt-4 pt-3 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Mode</span>
                <span className="font-medium text-gray-900">
                  {order.isDelivery ? '🚚 Livraison à domicile' : '🏪 Retrait en boutique'}
                </span>
              </div>
              {order.isDelivery && order.deliveryAddress && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Adresse</span>
                  <span className="text-gray-900 text-right max-w-xs">
                    {order.deliveryAddress}
                  </span>
                </div>
              )}
              {order.deliveryTime && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Heure souhaitée</span>
                  <span className="text-gray-900">
                    {new Date(order.deliveryTime).toLocaleString('fr-FR', {
                      day: 'numeric', month: 'short',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Paiement</span>
                <span className="font-medium text-gray-900">
                  {order.payment?.method === 'CASH' ? '💵 Espèces' : '📱 Mobile Money'}
                </span>
              </div>
              {order.payment && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Statut paiement</span>
                  <span className={`font-medium ${
                    order.payment.status === 'PAID'
                      ? 'text-green-600'
                      : 'text-orange-600'
                  }`}>
                    {order.payment.status === 'PAID' ? '✅ Payé' : '⏳ En attente'}
                  </span>
                </div>
              )}
              {order.notes && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Notes</span>
                  <span className="text-gray-900 text-right max-w-xs">{order.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact + Preuve */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-6 no-print">
            <p className="text-amber-800 text-sm sm:text-base font-medium mb-3 text-center">
              Une question sur votre commande ?
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              
                <a href="tel:+22670123456"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-amber-700 transition text-sm"
              >
                📞 Nous appeler
              </a>
              <button
                onClick={handlePrint}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-amber-600 text-amber-600 px-6 py-2.5 rounded-lg font-semibold hover:bg-amber-50 transition text-sm"
              >
                <Printer className="w-4 h-4" />
                Sauvegarder en PDF
              </button>
            </div>
            <p className="text-xs text-amber-700 mt-3 text-center">
              💡 Imprimez ou sauvegardez en PDF comme preuve de commande
            </p>
          </div>

        </div>
      </div>
    </>
  )
}