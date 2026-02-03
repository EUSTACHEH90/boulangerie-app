// src/app/admin/produits/[id]/EditerProduitClient.tsx
'use client'

import { useState, useEffect } from 'react'
import ProductForm from '@/components/admin/ProductForm'
import { getProductById, updateProduct } from '@/lib/api/products'
import type { Product, UpdateProductData } from '@/lib/api/products'

interface EditerProduitClientProps {
  id: string
  token: string
}

export default function EditerProduitClient({ id, token }: EditerProduitClientProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data } = await getProductById(id)
        setProduct(data)
      } catch (error) {
        console.error(error)
      } finally {
        setIsFetching(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleSubmit = async (data: UpdateProductData) => {
    setIsLoading(true)
    try {
      await updateProduct(id, data, token)
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-red-600">Produit non trouvé</p>
        </div>
      </div>
    )
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
