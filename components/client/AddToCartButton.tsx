// src/components/client/AddToCartButton.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Check } from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'
import type { Product } from '@/types'

interface AddToCartButtonProps {
  product: Product
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

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

    setJustAdded(true)
    setTimeout(() => {
      setIsAdding(false)
      setJustAdded(false)
    }, 1500)
  }

  const handleBuyNow = () => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
      category: product.category,
      weight: product.weight,
    })
    router.push('/panier')
  }

  if (!product.isAvailable) {
    return (
      <div className="space-y-3">
        <button
          disabled
          className="w-full bg-gray-300 text-gray-600 px-8 py-4 rounded-lg font-semibold cursor-not-allowed"
        >
          Produit indisponible
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleAddToCart}
        disabled={isAdding}
        className="w-full flex items-center justify-center gap-2 bg-amber-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-amber-700 transition disabled:opacity-50"
      >
        {justAdded ? (
          <>
            <Check className="w-5 h-5" />
            Ajouté au panier !
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5" />
            Ajouter au panier
          </>
        )}
      </button>

      <button
        onClick={handleBuyNow}
        className="w-full border-2 border-amber-600 text-amber-600 px-8 py-4 rounded-lg font-semibold hover:bg-amber-50 transition"
      >
        Acheter maintenant
      </button>
    </div>
  )
}