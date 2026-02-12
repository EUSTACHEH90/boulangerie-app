// app/admin/(dashboard)/produits/[id]/page.tsx

import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import prisma from '@/lib/db'
import EditerProduitClient from './EditerProduitClient'
import type { Product } from '@/types'

interface EditerProduitPageProps {
  params: Promise<{ id: string }>
}

export default async function EditerProduitPage({ params }: EditerProduitPageProps) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value || ''

  // ✅ Prisma direct
  const data = await prisma.product.findUnique({
    where: { id },
  })

  if (!data) notFound()

  const product: Product = {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    category: data.category as any,
    status: data.status as any,
    price: Number(data.price),
    image: data.image,
    images: data.images as string[],
    weight: data.weight,
    isAvailable: data.isAvailable,
    stock: data.stock,
    metaTitle: data.metaTitle,
    metaDescription: data.metaDescription,
    createdAt: data.createdAt.toISOString(),
    updatedAt: data.updatedAt.toISOString(),
  }

  return <EditerProduitClient product={product} token={token} />
}