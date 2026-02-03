// app/(clients)/produits/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { getProducts } from '@/lib/api/products'
import ProductCard from '@/components/client/ProductCard'
import { ProductCategory } from '@prisma/client'
import type { Product } from '@/types'
import { Search } from 'lucide-react'

export default function ProduitsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'ALL'>('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      try {
        const params: any = { limit: 100 }
        if (selectedCategory !== 'ALL') {
          params.category = selectedCategory
        }
        if (searchTerm) {
          params.search = searchTerm
        }

        const { data } = await getProducts(params)
        setProducts(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [selectedCategory, searchTerm])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Nos Produits</h1>
          <p className="text-gray-600">
            Découvrez notre sélection de pains, viennoiseries et pâtisseries artisanales
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recherche */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="search"
                  placeholder="Nom du produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition text-gray-900 bg-white placeholder-gray-400"
                />
              </div>
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`px-4 py-3 rounded-lg font-medium transition ${
                    selectedCategory === 'ALL'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setSelectedCategory('BOULANGERIE')}
                  className={`px-4 py-3 rounded-lg font-medium transition ${
                    selectedCategory === 'BOULANGERIE'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Boulangerie
                </button>
                <button
                  onClick={() => setSelectedCategory('VIENNOISERIE')}
                  className={`px-4 py-3 rounded-lg font-medium transition ${
                    selectedCategory === 'VIENNOISERIE'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Viennoiserie
                </button>
                <button
                  onClick={() => setSelectedCategory('PATISSERIE')}
                  className={`px-4 py-3 rounded-lg font-medium transition ${
                    selectedCategory === 'PATISSERIE'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pâtisserie
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Chargement...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Aucun produit trouvé</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="mt-8 text-center text-gray-600">
              {products.length} produit(s) affiché(s)
            </div>
          </>
        )}
      </div>
    </div>
  )
}