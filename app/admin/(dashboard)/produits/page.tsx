// src/app/admin/produits/page.tsx

import { cookies } from 'next/headers'
import Link from 'next/link'
import { getProducts } from '@/lib/api/products'
import ProductTable from '@/components/admin/ProductTable'
import type { Product } from '@/types'

export default async function ProduitsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value || ''

  const { data: products }: { data: Product[] } = await getProducts()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des produits</h1>
          <p className="text-gray-600 mt-1">{products.length} produit(s) au total</p>
        </div>
        <Link
          href="/admin/produits/nouveau"
          className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium"
        >
          + Nouveau produit
        </Link>
      </div>

      {/* Table */}
      <ProductTable products={products} token={token} />
    </div>
  )
}