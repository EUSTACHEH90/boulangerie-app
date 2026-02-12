// app/admin/(dashboard)/produits/[id]/EditerProduitClient.tsx
'use client'

import { useState } from 'react'
import ProductForm from '@/components/admin/ProductForm'
import { updateProduct } from '@/lib/api/products'
import type { Product } from '@/types'
import type { UpdateProductData } from '@/lib/api/products'

interface EditerProduitClientProps {
  product: Product  // ✅ Reçu depuis le serveur
  token: string
}

export default function EditerProduitClient({ product, token }: EditerProduitClientProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: UpdateProductData) => {
    setIsLoading(true)
    try {
      await updateProduct(product.id, data, token)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Éditer le produit</h1>
        <p className="text-gray-600 mt-1">Modifier les informations de {product.name}</p>
      </div>

      <ProductForm product={product} onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  )
}