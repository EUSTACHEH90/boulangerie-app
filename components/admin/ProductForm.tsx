// src/components/admin/ProductForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProductCategory, ProductStatus } from '@prisma/client'
import type { Product } from '@/types'
import type { CreateProductData } from '@/lib/api/products'

interface ProductFormProps {
  product?: Product
  onSubmit: (data: CreateProductData) => Promise<void>
  isLoading?: boolean
}

export default function ProductForm({ product, onSubmit, isLoading }: ProductFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<CreateProductData>({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || 'BOULANGERIE',
    status: product?.status || 'AVAILABLE',
    price: product?.price || 0,
    image: product?.image || '',
    weight: product?.weight || null,
    stock: product?.stock || null,
    isAvailable: product?.isAvailable ?? true,
    metaTitle: product?.metaTitle || '',
    metaDescription: product?.metaDescription || '',
  })

  const [errors, setErrors] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])

    try {
      await onSubmit(formData)
      router.push('/admin/produits')
      router.refresh()
    } catch (error) {
      if (error instanceof Error) {
        setErrors([error.message])
      }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Erreurs */}
        {errors.length > 0 && (
          <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <ul className="list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Informations de base */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Informations de base</h3>

          {/* Nom */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nom du produit *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 text-base text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
              placeholder="Ex: Croissant au beurre"
              style={{
                WebkitTextFillColor: '#111827',
                opacity: 1,
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 text-base text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition resize-none"
              placeholder="Description détaillée du produit"
              style={{
                WebkitTextFillColor: '#111827',
                opacity: 1,
              }}
            />
          </div>

          {/* Catégorie et Statut */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie *
              </label>
              <select
                id="category"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                className="w-full px-4 py-3 text-base text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
                style={{
                  WebkitTextFillColor: '#111827',
                  opacity: 1,
                }}
              >
                <option value="BOULANGERIE">Boulangerie</option>
                <option value="VIENNOISERIE">Viennoiserie</option>
                <option value="PATISSERIE">Pâtisserie</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                className="w-full px-4 py-3 text-base text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
                style={{
                  WebkitTextFillColor: '#111827',
                  opacity: 1,
                }}
              >
                <option value="AVAILABLE">Disponible</option>
                <option value="OUT_OF_STOCK">Rupture de stock</option>
                <option value="ARCHIVED">Archivé</option>
              </select>
            </div>
          </div>

          {/* Prix et Poids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Prix (FCFA) *
              </label>
              <input
                type="number"
                id="price"
                required
                min="0"
                step="1"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 text-base text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
                placeholder="1500"
                style={{
                  WebkitTextFillColor: '#111827',
                  opacity: 1,
                }}
              />
            </div>

            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                Poids (grammes)
              </label>
              <input
                type="number"
                id="weight"
                min="0"
                value={formData.weight || ''}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-4 py-3 text-base text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
                placeholder="80"
                style={{
                  WebkitTextFillColor: '#111827',
                  opacity: 1,
                }}
              />
            </div>
          </div>

          {/* Stock et Disponibilité */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                Stock (laisser vide pour illimité)
              </label>
              <input
                type="number"
                id="stock"
                min="0"
                value={formData.stock || ''}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-4 py-3 text-base text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
                placeholder="50"
                style={{
                  WebkitTextFillColor: '#111827',
                  opacity: 1,
                }}
              />
            </div>

            <div className="flex items-center pt-8">
              <input
                type="checkbox"
                id="isAvailable"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                className="w-5 h-5 text-amber-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-amber-200 cursor-pointer"
              />
              <label htmlFor="isAvailable" className="ml-3 text-sm font-medium text-gray-700 cursor-pointer">
                Produit disponible à la vente
              </label>
            </div>
          </div>

          {/* Image */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
              URL de l'image
            </label>
            <input
              type="url"
              id="image"
              value={formData.image || ''}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-4 py-3 text-base text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
              placeholder="https://example.com/image.jpg"
              style={{
                WebkitTextFillColor: '#111827',
                opacity: 1,
              }}
            />
            {formData.image && (
              <div className="mt-3">
                <img
                  src={formData.image}
                  alt="Aperçu"
                  className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* SEO */}
        <div className="pt-6 border-t-2 border-gray-200 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">SEO (optionnel)</h3>

          <div>
            <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-2">
              Titre SEO (max 60 caractères)
            </label>
            <input
              type="text"
              id="metaTitle"
              maxLength={60}
              value={formData.metaTitle || ''}
              onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
              className="w-full px-4 py-3 text-base text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
              placeholder="Titre optimisé pour les moteurs de recherche"
              style={{
                WebkitTextFillColor: '#111827',
                opacity: 1,
              }}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.metaTitle?.length || 0}/60</p>
          </div>

          <div>
            <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Description SEO (max 160 caractères)
            </label>
            <textarea
              id="metaDescription"
              rows={3}
              maxLength={160}
              value={formData.metaDescription || ''}
              onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
              className="w-full px-4 py-3 text-base text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition resize-none"
              placeholder="Description concise pour les résultats de recherche"
              style={{
                WebkitTextFillColor: '#111827',
                opacity: 1,
              }}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.metaDescription?.length || 0}/160</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t-2 border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Enregistrement...' : product ? 'Mettre à jour' : 'Créer le produit'}
          </button>
        </div>
      </form>
    </div>
  )
}