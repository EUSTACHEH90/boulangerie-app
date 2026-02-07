// src/app/actions/products.ts
'use server'

import prisma from '@/lib/db'
import { ProductCategory } from '@/types' // ✅ Import de l'enum
import { revalidatePath } from 'next/cache'

export async function createProduct(data: FormData) {
  // Générer le slug à partir du nom
  const name = data.get('name') as string
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9]+/g, '-')     // Remplace les caractères spéciaux par -
    .replace(/^-+|-+$/g, '')          // Supprime les - au début/fin

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      price: parseFloat(data.get('price') as string),
      category: data.get('category') as ProductCategory,
      description: data.get('description') as string || null,
      image: data.get('image') as string || null,
      // Tous les autres champs optionnels
    }
  })

  // Invalider le cache Next.js pour afficher le nouveau produit
  revalidatePath('/produits')
  revalidatePath('/admin/produits')

  return product
}