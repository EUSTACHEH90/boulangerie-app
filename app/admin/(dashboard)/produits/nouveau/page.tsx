// src/app/admin/produits/nouveau/page.tsx

import { cookies } from 'next/headers'
import NouveauProduitClient from './NouveauProduitClient'

export default async function NouveauProduitPage() {
  // ✅ Récupérer le token côté serveur
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value || ''

  return <NouveauProduitClient token={token} />
}