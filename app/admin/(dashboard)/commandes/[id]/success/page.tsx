// app/(clients)/commande/[id]/success/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function SuccessPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  // ✅ Redirection automatique vers le suivi après 4 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`/commande/${id}`)
    }, 4000)
    return () => clearTimeout(timer)
  }, [id, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full mx-auto text-center">
        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <span className="text-4xl">🥖</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Commande confirmée !
          </h1>

          <p className="text-gray-600 mb-8 text-sm sm:text-base">
            Merci pour votre commande. Vous allez être redirigé vers la page de suivi dans quelques secondes...
          </p>

          <Link
            href={`/commande/${id}`}
            className="block w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition text-sm sm:text-base"
          >
            Suivre ma commande →
          </Link>

          <Link
            href="/produits"
            className="block w-full text-amber-600 hover:text-amber-700 mt-3 font-medium text-sm"
          >
            Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  )
}