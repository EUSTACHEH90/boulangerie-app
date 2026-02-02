// src/components/admin/AdminNav.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import LogoutButton from './LogoutButton'

export default function AdminNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Navigation Desktop : Cachée sur mobile */}
      <nav className="hidden md:flex gap-6 ml-4">
        <Link href="/admin/produits" className="text-gray-700 hover:text-amber-600 transition font-medium">
          Produits
        </Link>
        <Link href="/admin/commandes" className="text-gray-700 hover:text-amber-600 transition font-medium">
          Commandes
        </Link>
      </nav>

      {/* Bouton Menu Mobile */}
      <div className="md:hidden flex items-center">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-700 p-2 focus:outline-none hover:bg-gray-100 rounded-md transition"
          aria-label="Menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            )}
          </svg>
        </button>
      </div>

      {/* Menu Mobile Déroulant (Dropdown) */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b shadow-xl z-50 md:hidden animate-in slide-in-from-top duration-200">
          <div className="flex flex-col p-4 gap-2">
            <Link 
              href="/admin/produits" 
              onClick={() => setIsOpen(false)}
              className="text-gray-700 font-medium py-3 px-4 hover:bg-amber-50 rounded-md"
            >
              Produits
            </Link>
            <Link 
              href="/admin/commandes" 
              onClick={() => setIsOpen(false)}
              className="text-gray-700 font-medium py-3 px-4 hover:bg-amber-50 rounded-md"
            >
              Commandes
            </Link>
            <div className="border-t border-gray-100 mt-2 pt-4 flex flex-col gap-4 px-4">
              <Link href="/" className="text-amber-600 font-medium">
                Voir le site
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      )}
    </>
  )
}