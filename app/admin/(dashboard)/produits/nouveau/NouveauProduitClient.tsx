// src/app/admin/produits/nouveau/NouveauProduitClient.tsx
'use client'

import { useState } from 'react'
import ProductForm from '@/components/admin/ProductForm'
import { createProduct } from '@/lib/api/products'
import type { CreateProductData } from '@/lib/api/products'

interface NouveauProduitClientProps {
  token: string
}

export default function NouveauProduitClient({ token }: NouveauProduitClientProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: CreateProductData) => {
    setIsLoading(true)
    try {
      await createProduct(data, token)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Nouveau produit</h1>
        <p className="text-gray-600 mt-1">Créer un nouveau produit dans le catalogue</p>
      </div>

      <ProductForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  )
}