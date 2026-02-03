// src/app/admin/produits/[id]/page.tsx

import { cookies } from 'next/headers'
import EditerProduitClient from './EditerProduitClient'

interface EditerProduitPageProps {
  params: Promise<{ id: string }> 
}

export default async function EditerProduitPage({ params }: EditerProduitPageProps) {
  const { id } = await params  
  // ✅ Récupérer le token côté serveur
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value || ''

  return <EditerProduitClient id={id} token={token} />
}