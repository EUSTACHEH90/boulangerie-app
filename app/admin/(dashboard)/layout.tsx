//app/admin/layout.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminNav from '@/components/admin/AdminNav'
import LogoutButton from '@/components/admin/LogoutButton'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value 

  // Sécurité côté serveur
  if (!token) {
    redirect('/admin/login') 
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Admin */}
      <header className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo et Nom : Toujours ensemble, même sur petit écran */}
            <div className="flex items-center gap-2">
              <Link href="/admin/produits" className="flex items-center gap-2 shrink-0">
                <span className="text-xl sm:text-2xl">🥖</span>
                <span className="text-lg sm:text-xl font-bold text-gray-900 whitespace-nowrap">
                  Ma Boulangerie
                </span>
              </Link>
              
              {/* On insère ici le composant qui contient la Nav Desktop et le bouton Mobile */}
              <AdminNav />
            </div>

            {/* Actions Desktop : Cachées sur mobile (gérées par AdminNav sur mobile) */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/produits"
                className="text-sm text-gray-600 hover:text-gray-900 transition"
              >
                Voir le site 
              </Link>
              <LogoutButton /> 
            </div>

          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}