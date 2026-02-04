// app/(clients)/page.tsx

import Link from 'next/link'

import ProductCard from '@/components/client/ProductCard'
import prisma from '@/lib/db'

export default async function HomePage() {
  // ✅ Requête directe Prisma au lieu de fetch
  const products = await prisma.product.findMany({
    where: { 
      isAvailable: true,
      status: 'AVAILABLE'
    },
    take: 6,
    orderBy: { createdAt: 'desc' },
  })

  // Convertir les données Prisma
   const productsData = products.map((product: any) => ({ 
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    category: product.category as any,
    status: product.status as any,
    price: Number(product.price),
    image: product.image,
    images: product.images as string[],
    weight: product.weight,
    isAvailable: product.isAvailable,
    stock: product.stock,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }))

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Bienvenue chez Ma Boulangerie</h1>
          <p className="text-xl mb-8">
            Pain frais et pâtisseries artisanales depuis 1990
          </p>
          <Link
            href="/produits"
            className="inline-block bg-white text-amber-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Découvrir nos produits
          </Link>
        </div>
      </section>

      {/* Produits populaires */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Nos produits populaires
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productsData.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/produits"
              className="inline-block bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-700 transition"
            >
              Voir tous les produits
            </Link>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🥖</div>
              <h3 className="text-xl font-semibold mb-2">Produits frais</h3>
              <p className="text-gray-600">
                Pain et pâtisseries préparés chaque jour
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🚚</div>
              <h3 className="text-xl font-semibold mb-2">Livraison rapide</h3>
              <p className="text-gray-600">
                Livraison à domicile dans toute la ville
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">💳</div>
              <h3 className="text-xl font-semibold mb-2">Paiement sécurisé</h3>
              <p className="text-gray-600">
                Mobile Money et paiement en espèces
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}