// src/components/client/ProductCard.tsx

import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@prisma/client'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  // Formater le prix en FCFA
  const formattedPrice = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(Number(product.price))

  return (
    <Link 
      href={`/produits/${product.slug}`}
      className="group block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-64 w-full bg-gray-200">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            🥖
          </div>
        )}
        
        {/* Badge de catégorie */}
        <div className="absolute top-2 right-2 bg-amber-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
          {product.category}
        </div>

        {/* Badge rupture de stock */}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
              Rupture de stock
            </span>
          </div>
        )}
      </div>

      {/* Informations */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-2xl font-bold text-amber-600">
            {formattedPrice}
          </span>
          
          {product.weight && (
            <span className="text-sm text-gray-500">
              {product.weight}g
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}