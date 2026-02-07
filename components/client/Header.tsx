// app/components/client/Header.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const totalItems = useCartStore((state) => state.getTotalItems())

  // ✅ Utiliser useEffect pour éviter l'hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-amber-600 flex items-center gap-2">
            🥖 Ma Boulangerie
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-700 hover:text-amber-600 transition">
              Accueil
            </Link>
            <Link href="/produits" className="text-gray-700 hover:text-amber-600 transition">
              Nos Produits
            </Link>
            <Link href="/a-propos" className="text-gray-700 hover:text-amber-600 transition">
              À Propos
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-amber-600 transition">
              Contact
            </Link>
            <Link
              href="/panier"
              className="relative text-gray-700 hover:text-amber-600 transition"
            >
              <ShoppingCart className="w-6 h-6" />
              {isClient && totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link
              href="/"
              className="block text-gray-700 hover:text-amber-600 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link
              href="/produits"
              className="block text-gray-700 hover:text-amber-600 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Nos Produits
            </Link>
            <Link
              href="/a-propos"
              className="block text-gray-700 hover:text-amber-600 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              À Propos
            </Link>
            <Link
              href="/contact"
              className="block text-gray-700 hover:text-amber-600 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <Link
              href="/panier"
              className="block text-gray-700 hover:text-amber-600 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Panier {isClient && totalItems > 0 && `(${totalItems})`}
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}