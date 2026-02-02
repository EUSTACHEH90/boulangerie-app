// src/components/admin/ProductTable.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteProduct } from '@/lib/api/products'
import type { Product } from '@/types'

interface ProductTableProps {
  products: Product[]
  token: string
}

export default function ProductTable({ products, token }: ProductTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ?`)) {
      return
    }

    setDeletingId(id)
    try {
      await deleteProduct(id, token)
      router.refresh()
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      }
    } finally {
      setDeletingId(null)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getCategoryBadge = (category: string) => {
    const colors = {
      BOULANGERIE: 'bg-yellow-100 text-yellow-800',
      VIENNOISERIE: 'bg-orange-100 text-orange-800',
      PATISSERIE: 'bg-pink-100 text-pink-800',
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusBadge = (status: string, isAvailable: boolean) => {
    if (!isAvailable) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Indisponible</span>
    }
    
    const badges = {
      AVAILABLE: <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Disponible</span>,
      OUT_OF_STOCK: <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">Rupture</span>,
      ARCHIVED: <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Archivé</span>,
    }
    return badges[status as keyof typeof badges] || null
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catégorie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover mr-3"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      {product.weight && (
                        <div className="text-sm text-gray-500">{product.weight}g</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadge(product.category)}`}>
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatPrice(product.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.stock !== null ? product.stock : 'Illimité'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(product.status, product.isAvailable)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/admin/produits/${product.id}`}
                    className="text-amber-600 hover:text-amber-900 mr-4"
                  >
                    Éditer
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                    disabled={deletingId === product.id}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    {deletingId === product.id ? 'Suppression...' : 'Supprimer'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucun produit trouvé</p>
        </div>
      )}
    </div>
  )
}