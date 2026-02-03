// src/app/(clients)/commande/[id]/success/page.tsx

import Link from 'next/link'
import { CheckCircle, Package, Clock } from 'lucide-react'

interface SuccessPageProps {
  params: Promise<{ id: string }>  // ✅ Promise
}

export default async function SuccessPage({ params }: SuccessPageProps) {
  const { id } = await params  // ✅ Await params
  
  const orderResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/commandes/${id}`,
    { cache: 'no-store' }
  )
  
  const { data: order } = await orderResponse.json()

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-red-600 text-lg">Commande non trouvée</p>
          <Link href="/" className="text-amber-600 hover:underline mt-4 inline-block">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Commande confirmée !
          </h1>
          
          <p className="text-gray-600 mb-8">
            Merci pour votre commande. Nous avons bien reçu votre demande.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
            <p className="text-sm text-gray-600 mb-2">Numéro de commande</p>
            <p className="text-2xl font-bold text-amber-600">{order.orderNumber}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-6 rounded-lg text-left">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Articles
              </h3>
              <div className="space-y-2">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.quantity}x {item.productName}
                    </span>
                    <span className="font-semibold">{formatPrice(Number(item.subtotal))}</span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-amber-600">{formatPrice(Number(order.total))}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg text-left">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Prochaines étapes
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Commande reçue</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">○</span>
                  <span>Confirmation par notre équipe</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">○</span>
                  <span>Préparation de votre commande</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">○</span>
                  <span>{order.isDelivery ? 'Livraison' : 'Prête pour retrait'}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/commande/${order.id}`}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition"
            >
              Suivre ma commande
            </Link>
            <Link
              href="/produits"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}