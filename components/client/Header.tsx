// src/components/client/Header.tsx
'use client'

import Link from 'next/link'
import { useCartStore } from '@/lib/store/cartStore'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const totalItems = useCartStore((state) => state.getTotalItems())

  // Attendre que le composant soit monté côté client
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-amber-600">🥖 Ma Boulangerie</span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex space-x-8">
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
          </nav>

          {/* Panier */}
          <Link
            href="/panier"
            className="relative p-2 text-gray-700 hover:text-amber-600 transition"
          >
            <ShoppingCart className="w-6 h-6" />
            {/* Afficher le badge uniquement après le montage côté client */}
            {mounted && totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Menu Mobile */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Menu Mobile Dropdown */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 space-y-2">
            <Link
              href="/"
              className="block px-4 py-2 text-gray-700 hover:bg-amber-50 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link
              href="/produits"
              className="block px-4 py-2 text-gray-700 hover:bg-amber-50 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Nos Produits
            </Link>
            <Link
              href="/a-propos"
              className="block px-4 py-2 text-gray-700 hover:bg-amber-50 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              À Propos
            </Link>
            <Link
              href="/contact"
              className="block px-4 py-2 text-gray-700 hover:bg-amber-50 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}