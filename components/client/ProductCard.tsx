// src/components/client/ProductCard.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store/cartStore'
import { ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const [isAdding, setIsAdding] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleAddToCart = () => {
    setIsAdding(true)
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
      category: product.category,
      weight: product.weight,
    })
    setTimeout(() => setIsAdding(false), 500)
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      BOULANGERIE: 'bg-yellow-100 text-yellow-800',
      VIENNOISERIE: 'bg-orange-100 text-orange-800',
      PATISSERIE: 'bg-pink-100 text-pink-800',
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      {/* Image */}
      <Link href={`/produits/${product.slug}`} className="relative h-64 bg-gray-200">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-6xl">🥖</div>
        )}

        {/* Badge catégorie */}
        <div className="absolute top-2 right-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(product.category)}`}>
            {product.category}
          </span>
        </div>

        {/* Badge rupture de stock */}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
              Rupture de stock
            </span>
          </div>
        )}
      </Link>

      {/* Contenu */}
      <div className="p-4 flex flex-col flex-grow">
        <Link href={`/produits/${product.slug}`}>
          <h3 className="text-lg font-semibold text-gray-900 hover:text-amber-600 transition mb-2">
            {product.name}
          </h3>
        </Link>

        {product.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
            {product.description}
          </p>
        )}

        {/* Prix et action */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t">
          <div>
            <span className="text-2xl font-bold text-amber-600">
              {formatPrice(product.price)}
            </span>
            {product.weight && (
              <span className="text-sm text-gray-500 ml-2">({product.weight}g)</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.isAvailable || isAdding}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-4 h-4" />
            {isAdding ? 'Ajouté !' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  )
}