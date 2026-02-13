// app/(clients)/mes-commandes/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Package, ChevronRight, Lock } from 'lucide-react'

const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  PENDING:   { label: 'En attente',     color: 'bg-yellow-100 text-yellow-800', icon: '📋' },
  CONFIRMED: { label: 'Confirmée',      color: 'bg-blue-100 text-blue-800',     icon: '✅' },
  PREPARING: { label: 'En préparation', color: 'bg-orange-100 text-orange-800', icon: '👨‍🍳' },
  READY:     { label: 'Prête',          color: 'bg-green-100 text-green-800',   icon: '🎉' },
  COMPLETED: { label: 'Livrée',         color: 'bg-gray-100 text-gray-800',     icon: '🥖' },
  CANCELLED: { label: 'Annulée',        color: 'bg-red-100 text-red-800',       icon: '❌' },
}

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  isDelivery: boolean
  createdAt: string
  items: { productName: string; quantity: number }[]
}

export default function MesCommandesPage() {
  const [phone, setPhone] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [blocked, setBlocked] = useState(false)

  const MAX_ATTEMPTS = 5

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (blocked || !phone.trim() || !orderNumber.trim()) return

    setLoading(true)
    setError('')
    setSearched(false)
    setOrder(null)

    try {
      const response = await fetch(
        `/api/commandes/verify?phone=${encodeURIComponent(phone.trim())}&orderNumber=${encodeURIComponent(orderNumber.trim().toUpperCase())}`
      )

      if (response.status === 429) {
        setBlocked(true)
        setError('Trop de tentatives. Réessayez dans 10 minutes.')
        return
      }

      if (response.status === 404) {
        const newAttempts = attempts + 1
        setAttempts(newAttempts)

        if (newAttempts >= MAX_ATTEMPTS) {
          setBlocked(true)
          setError('Trop de tentatives. Réessayez dans 10 minutes.')
          setTimeout(() => {
            setBlocked(false)
            setAttempts(0)
          }, 10 * 60 * 1000)
        } else {
          setError(
            `Téléphone ou numéro de commande incorrect. (${newAttempts}/${MAX_ATTEMPTS} tentatives)`
          )
        }
        setSearched(true)
        return
      }

      if (!response.ok) throw new Error('Erreur serveur')

      const data = await response.json()
      setOrder(data.data)
      setSearched(true)
      setAttempts(0)

    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Suivre ma commande
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Entrez les informations reçues par WhatsApp/SMS
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">

          {/* Info sécurité */}
          <div className="flex items-center gap-2 mb-5 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
            <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span>
              Vos informations sont utilisées uniquement pour accéder à votre commande
            </span>
          </div>

          <div className="space-y-4">
            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone utilisé lors de la commande *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+226 70 12 34 56"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition text-gray-900 bg-white text-sm sm:text-base"
                required
                disabled={blocked}
              />
            </div>

            {/* Numéro de commande */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de commande reçu par message *
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                placeholder="CMD-XXXXXXXX"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition text-gray-900 bg-white text-sm sm:text-base uppercase tracking-wider"
                required
                disabled={blocked}
              />
              <p className="text-xs text-gray-500 mt-1.5">
                💡 Reçu par WhatsApp/SMS après votre commande
              </p>
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div className={`mt-4 p-3 rounded-lg text-sm flex items-start gap-2 ${
              blocked
                ? 'bg-red-50 border border-red-200 text-red-700'
                : 'bg-orange-50 border border-orange-200 text-orange-700'
            }`}>
              <span className="flex-shrink-0">{blocked ? '🔒' : '⚠️'}</span>
              <span>{error}</span>
            </div>
          )}

          {/* Bouton */}
          <button
            type="submit"
            disabled={loading || blocked}
            className="w-full mt-5 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Recherche en cours...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Voir ma commande
              </>
            )}
          </button>
        </form>

        {/* Résultat */}
        {searched && order && (
          <div className="space-y-3">
            <p className="text-sm text-green-600 font-medium px-1">
              ✅ Commande trouvée !
            </p>

            <Link
              href={`/commande/${order.id}`}
              className="block bg-white rounded-xl shadow-md p-4 sm:p-5 hover:shadow-lg transition group border-2 border-amber-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-bold text-gray-900 text-base sm:text-lg">
                    {order.orderNumber}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(() => {
                    const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.PENDING
                    return (
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                    )
                  })()}
                  <ChevronRight className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div className="space-y-1 mb-3">
                {order.items.slice(0, 3).map((item, index) => (
                  <p key={index} className="text-sm text-gray-600">
                    {item.quantity}x {item.productName}
                  </p>
                ))}
                {order.items.length > 3 && (
                  <p className="text-xs text-gray-400">
                    +{order.items.length - 3} autre(s) article(s)
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  {order.isDelivery ? '🚚 Livraison' : '🏪 Retrait en boutique'}
                </span>
                <span className="font-bold text-amber-600">
                  {formatPrice(order.total)}
                </span>
              </div>

              <div className="mt-3 text-center">
                <span className="text-xs text-amber-600 font-medium">
                  👆 Cliquez pour voir la progression détaillée
                </span>
              </div>
            </Link>
          </div>
        )}

        {/* Aide */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
          <p className="font-medium mb-1">📱 Vous n'avez pas reçu de message ?</p>
          <p className="text-xs">
            Vérifiez votre WhatsApp ou SMS. Si vous n'avez rien reçu,{' '}
            <a href="tel:+22670123456" className="underline font-medium">
              appelez-nous
            </a>.
          </p>
        </div>

      </div>
    </div>
  )
}