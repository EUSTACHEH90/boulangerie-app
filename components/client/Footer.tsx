// src/components/client/Footer.tsx

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* À propos */}
          <div>
            <h3 className="text-lg font-bold mb-4">Ma Boulangerie</h3>
            <p className="text-gray-400">
              Artisan boulanger depuis 1990. Pain frais et pâtisseries faits maison chaque jour.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-lg font-bold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/produits" className="text-gray-400 hover:text-white transition">
                  Nos produits
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="text-gray-400 hover:text-white transition">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400">
              <li>📍 Ouagadougou, Burkina Faso</li>
              <li>📞 +226 70 12 34 56</li>
              <li>✉️ contact@maboulangerie.com</li>
              <li>🕐 Lun-Sam: 6h-20h</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Ma Boulangerie. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}