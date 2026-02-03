// src/app/(clients)/produits/[slug]/page.tsx

import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import AddToCartButton from '@/components/client/AddToCartButton'

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>  // ✅ Promise
}

async function getProductBySlug(slug: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/produits/slug/${slug}`,
      { cache: 'no-store' }
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error(error)
    return null
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params  // ✅ Await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      BOULANGERIE: 'Boulangerie',
      VIENNOISERIE: 'Viennoiserie',
      PATISSERIE: 'Pâtisserie',
    }
    return labels[category] || category
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/produits"
            className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux produits
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            <div className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full text-9xl">
                  {product.category === 'BOULANGERIE' && '🥖'}
                  {product.category === 'VIENNOISERIE' && '🥐'}
                  {product.category === 'PATISSERIE' && '🍰'}
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-sm font-semibold rounded-full">
                  {getCategoryLabel(product.category)}
                </span>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {product.description && (
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                  {product.description}
                </p>
              )}

              <div className="space-y-3 mb-8 bg-gray-50 p-4 rounded-lg">
                {product.weight && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Poids</span>
                    <span className="font-semibold text-gray-900">
                      {product.weight}g
                    </span>
                  </div>
                )}
                {product.stock !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Stock</span>
                    <span className="font-semibold text-gray-900">
                      {product.stock > 0 ? `${product.stock} disponible(s)` : 'Rupture de stock'}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Disponibilité</span>
                  <span
                    className={`font-semibold ${
                      product.isAvailable ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {product.isAvailable ? 'En stock' : 'Indisponible'}
                  </span>
                </div>
              </div>

              <div className="mt-auto">
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-bold text-amber-600">
                    {formatPrice(product.price)}
                  </span>
                  {product.weight && (
                    <span className="text-gray-500">/ {product.weight}g</span>
                  )}
                </div>

                <AddToCartButton product={product} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}