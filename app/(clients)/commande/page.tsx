// app/(clients)/commande/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store/cartStore'

export default function CommandePage() {
  const router = useRouter()
  const { items, getTotalPrice, getTotalItems, clearCart } = useCartStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    isDelivery: false,
    deliveryAddress: '',
    deliveryTime: '',
    notes: '',
    paymentMethod: 'CASH' as 'CASH' | 'MOBILE_MONEY',
    phoneNumber: '',
    operator: '',
  })

  useEffect(() => {
    if (items.length === 0) {
      router.push('/panier')
    }
  }, [items, router])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const deliveryFee = formData.isDelivery ? 2000 : 0
  const total = getTotalPrice() + deliveryFee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const orderData = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail || undefined,
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        isDelivery: formData.isDelivery,
        deliveryAddress: formData.isDelivery ? formData.deliveryAddress : undefined,
        deliveryTime: formData.deliveryTime || undefined,
        notes: formData.notes || undefined,
        paymentMethod: formData.paymentMethod,
        phoneNumber: formData.paymentMethod === 'MOBILE_MONEY' ? formData.phoneNumber : undefined,
        operator: formData.paymentMethod === 'MOBILE_MONEY' ? formData.operator : undefined,
      }

      const response = await fetch('/api/commandes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la commande')
      }

      clearCart()
      router.push(`/commande/${data.data.id}/success`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-8">
          Finaliser ma commande
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Formulaire - 2/3 sur desktop, pleine largeur sur mobile */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              
              {/* Informations client */}
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                  Vos informations
                </h2>

                {error && (
                  <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition text-sm sm:text-base"
                      placeholder="Ex: Jean Dupont"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition text-sm sm:text-base"
                      placeholder="+226 70 12 34 56"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email (optionnel)
                    </label>
                    <input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition text-sm sm:text-base"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Livraison */}
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                  Mode de récupération
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                  <label className={`cursor-pointer p-3 sm:p-4 border-2 rounded-lg transition ${
                    !formData.isDelivery 
                      ? 'border-amber-500 bg-amber-50' 
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}>
                    <input
                      type="radio"
                      name="delivery"
                      checked={!formData.isDelivery}
                      onChange={() => setFormData({ ...formData, isDelivery: false })}
                      className="sr-only"
                    />
                    <p className="font-bold text-gray-900 text-sm sm:text-base">🏪 Retrait en boutique</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Gratuit</p>
                  </label>

                  <label className={`cursor-pointer p-3 sm:p-4 border-2 rounded-lg transition ${
                    formData.isDelivery 
                      ? 'border-amber-500 bg-amber-50' 
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}>
                    <input
                      type="radio"
                      name="delivery"
                      checked={formData.isDelivery}
                      onChange={() => setFormData({ ...formData, isDelivery: true })}
                      className="sr-only"
                    />
                    <p className="font-bold text-gray-900 text-sm sm:text-base">🚚 Livraison à domicile</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">2 000 FCFA</p>
                  </label>
                </div>

                {formData.isDelivery && (
                  <div className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse de livraison *
                      </label>
                      <textarea
                        required={formData.isDelivery}
                        value={formData.deliveryAddress}
                        onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                        rows={3}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition text-sm sm:text-base resize-none"
                        placeholder="Secteur, rue, indication..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Heure de livraison souhaitée
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.deliveryTime}
                        onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition text-sm sm:text-base"
                      />
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optionnel)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition text-sm sm:text-base resize-none"
                    placeholder="Instructions particulières..."
                  />
                </div>
              </div>

              {/* Paiement */}
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                  Mode de paiement
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                  <label className={`cursor-pointer p-3 sm:p-4 border-2 rounded-lg transition ${
                    formData.paymentMethod === 'CASH' 
                      ? 'border-amber-500 bg-amber-50' 
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={formData.paymentMethod === 'CASH'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'CASH' })}
                      className="sr-only"
                    />
                    <p className="font-bold text-gray-900 text-sm sm:text-base">💵 Espèces</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">À la livraison</p>
                  </label>

                  <label className={`cursor-pointer p-3 sm:p-4 border-2 rounded-lg transition ${
                    formData.paymentMethod === 'MOBILE_MONEY' 
                      ? 'border-amber-500 bg-amber-50' 
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={formData.paymentMethod === 'MOBILE_MONEY'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'MOBILE_MONEY' })}
                      className="sr-only"
                    />
                    <p className="font-bold text-gray-900 text-sm sm:text-base">📱 Mobile Money</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Orange, Moov, MTN</p>
                  </label>
                </div>

                {formData.paymentMethod === 'MOBILE_MONEY' && (
                  <div className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Opérateur *
                      </label>
                      <select
                        required
                        value={formData.operator}
                        onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition text-sm sm:text-base"
                      >
                        <option value="">Choisir un opérateur</option>
                        <option value="Orange">Orange Money</option>
                        <option value="Moov">Moov Money</option>
                        <option value="MTN">MTN Mobile Money</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Numéro Mobile Money *
                      </label>
                      <input
                        type="tel"
                        required={formData.paymentMethod === 'MOBILE_MONEY'}
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition text-sm sm:text-base"
                        placeholder="+226 56 37 96 23"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Bouton mobile (visible seulement sur mobile, en bas du formulaire) */}
              <div className="lg:hidden">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 sm:py-4 rounded-lg font-bold text-white transition text-sm sm:text-base ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {isSubmitting ? 'Traitement...' : `Confirmer • ${formatPrice(total)}`}
                </button>
                <p className="text-xs text-gray-600 text-center mt-3">
                  En confirmant, vous acceptez nos conditions de vente
                </p>
              </div>
            </div>

            {/* Récapitulatif - 1/3 sur desktop, sticky */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:sticky lg:top-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                  Récapitulatif
                </h2>

                <div className="space-y-2 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-bold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-3 sm:pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Sous-total</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Livraison</span>
                    <span>{formatPrice(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between text-base sm:text-lg font-bold border-t border-gray-200 pt-2 sm:pt-3">
                    <span className="text-gray-900">Total</span>
                    <span className="text-amber-600">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Bouton desktop (caché sur mobile) */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`hidden lg:block w-full mt-6 py-3 rounded-lg font-bold text-white transition ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {isSubmitting ? 'Traitement...' : 'Confirmer la commande'}
                </button>

                <p className="hidden lg:block text-xs text-gray-600 text-center mt-3">
                  En confirmant, vous acceptez nos conditions de vente
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}