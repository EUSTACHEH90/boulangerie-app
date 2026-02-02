// src/app/admin/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogIn } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de connexion')
      }

      // Stocker le token dans un cookie
      document.cookie = `auth_token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 jours

      // Rediriger vers l'admin
      router.push('/admin/produits')
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo et titre */}
        <div className="text-center">
          <div className="text-6xl mb-4">🥖</div>
          <h2 className="text-3xl font-bold text-gray-900">
            Administration
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Connectez-vous pour gérer votre boulangerie
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="admin@bakery.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn className="w-5 h-5" />
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Credentials de test */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-semibold mb-2">
              Identifiants de test :
            </p>
            <p className="text-sm text-blue-700">
              Email : <code className="bg-blue-100 px-2 py-1 rounded">admin@bakery.com</code>
            </p>
            <p className="text-sm text-blue-700">
              Mot de passe : <code className="bg-blue-100 px-2 py-1 rounded">Admin@123</code>
            </p>
          </div>
        </div>

        {/* Lien retour */}
        <div className="text-center">
          <a
            href="/"
            className="text-sm text-amber-600 hover:text-amber-700 transition"
          >
            ← Retour au site
          </a>
        </div>
      </div>
    </div>
  )
}