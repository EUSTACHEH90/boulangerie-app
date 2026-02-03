// app/(clients)/panier/page.tsx
'use client'

import { useCartStore } from '@/lib/store/cartStore'
import Link from 'next/link'
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react'
import Image from 'next/image'

export default function PanierPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems } = useCartStore()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Votre panier est vide</h1>
          <p className="text-gray-600 mb-8">
            Découvrez nos délicieux produits et ajoutez-les à votre panier
          </p>
          <Link
            href="/produits"
            className="inline-block bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-700 transition"
          >
            Découvrir nos produits
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Mon panier ({getTotalItems()} article{getTotalItems() > 1 ? 's' : ''})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des articles */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="relative w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-4xl">
                        {item.category === 'BOULANGERIE' && '🥖'}
                        {item.category === 'VIENNOISERIE' && '🥐'}
                        {item.category === 'PATISSERIE' && '🍰'}
                      </div>
                    )}
                  </div>

                  {/* Informations */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          {item.category}
                          {item.weight && ` • ${item.weight}g`}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700 transition p-2"
                        title="Retirer du panier"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Contrôles de quantité */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                          aria-label="Diminuer la quantité"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                        
                        <span className="w-12 text-center font-semibold text-gray-900 text-lg">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center border-2 border-amber-600 bg-amber-600 rounded-lg text-white hover:bg-amber-700 hover:border-amber-700 transition"
                          aria-label="Augmenter la quantité"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Prix */}
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {formatPrice(item.price)} × {item.quantity}
                        </p>
                        <p className="text-xl font-bold text-amber-600">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Récapitulatif */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Récapitulatif</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span className="font-semibold text-gray-900">{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Livraison</span>
                  <span className="text-sm text-gray-500">Calculée à la prochaine étape</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-xl font-bold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-amber-600">{formatPrice(getTotalPrice())}</span>
                </div>
              </div>

              <Link
                href="/commande"
                className="block w-full bg-amber-600 text-white text-center px-6 py-4 rounded-lg font-semibold hover:bg-amber-700 transition"
              >
                Commander
              </Link>

              <Link
                href="/produits"
                className="block w-full text-center text-amber-600 hover:text-amber-700 mt-4 font-medium"
              >
                Continuer mes achats
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}