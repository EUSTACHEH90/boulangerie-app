// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { ProductCategory, ProductStatus } from '@/lib/enums'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Nettoyage de la base de données...')
  await prisma.orderItem.deleteMany({})
  await prisma.product.deleteMany({})

  const hashedPassword = await bcrypt.hash('Admin@123', 10)
  await prisma.admin.upsert({
    where: { email: 'admin@bakery.com' },
    update: {},
    create: {
      email: 'admin@bakery.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'SUPER_ADMIN', // ✅ String directe (Prisma accepte ça)
    },
  })

  const products = [
    {
      name: 'Croissant au beurre',
      slug: 'croissant-beurre',
      description: 'Délicieux croissant pur beurre artisanal',
      category: ProductCategory.VIENNOISERIE,
      price: 1500,
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=500',
      weight: 80,
      stock: 50,
    },
    {
      name: 'Baguette tradition',
      slug: 'baguette-tradition',
      description: 'Baguette tradition française croustillante',
      category: ProductCategory.BOULANGERIE,
      price: 800,
      image: 'https://images.unsplash.com/photo-1597079910443-60c43fc4f72f?q=80&w=500',
      weight: 250,
      stock: 100,
    },
    {
      name: 'Pain au chocolat',
      slug: 'pain-chocolat',
      description: 'Pain au chocolat avec pépites de chocolat noir',
      category: ProductCategory.VIENNOISERIE,
      price: 1200,
      image: 'https://images.unsplash.com/photo-1623334044303-241021148842?q=80&w=500',
      weight: 90,
      stock: 40,
    },
    {
      name: 'Éclair au café',
      slug: 'eclair-cafe',
      description: 'Éclair gourmand fourré à la crème au café',
      category: ProductCategory.PATISSERIE,
      price: 2000,
      image: 'https://images.unsplash.com/photo-1511961234817-068305f6368d?q=80&w=500',
      weight: 100,
      stock: 20,
    },
    {
      name: 'Tarte aux pommes',
      slug: 'tarte-pommes',
      description: 'Tarte aux pommes maison avec crème pâtissière',
      category: ProductCategory.PATISSERIE,
      price: 3500,
      image: 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?q=80&w=500',
      weight: 400,
      stock: 10,
    },
    {
      name: 'Pain complet',
      slug: 'pain-complet',
      description: 'Pain complet aux céréales riche en fibres',
      category: ProductCategory.BOULANGERIE,
      price: 1000,
      image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=500',
      weight: 500,
      stock: 30,
    },
    {
      name: 'Mille-feuille',
      slug: 'mille-feuille-vanille',
      description: 'Pâte feuilletée croustillante et crème vanille',
      category: ProductCategory.PATISSERIE,
      price: 2500,
      image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=500',
      weight: 120,
      stock: 15,
    },
    {
      name: 'Brioche tressée',
      slug: 'brioche-tressee',
      description: 'Brioche moelleuse au sucre perlé',
      category: ProductCategory.VIENNOISERIE,
      price: 3000,
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=500',
      weight: 400,
      stock: 25,
    },
    {
      name: 'Pain de campagne',
      slug: 'pain-campagne-levain',
      description: 'Pain au levain naturel cuit au four à pierre',
      category: ProductCategory.BOULANGERIE,
      price: 1800,
      image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?q=80&w=500',
      weight: 600,
      stock: 20,
    },
    {
      name: 'Paris-Brest',
      slug: 'paris-brest-praline',
      description: 'Pâte à choux et crème mousseline pralinée',
      category: ProductCategory.PATISSERIE,
      price: 2800,
      image: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?q=80&w=500',
      weight: 150,
      stock: 12,
    },
    {
      name: 'Macarons Assortis',
      slug: 'macarons-assortis-coffret',
      description: 'Coffret de 6 macarons artisanaux (Vanille, Chocolat, Pistache)',
      category: ProductCategory.PATISSERIE,
      price: 5000,
      image: 'https://images.unsplash.com/photo-1569864358642-9d16197022c9?q=80&w=500',
      weight: 150,
      stock: 15,
    },
  ]
  for (const product of products) {
    await prisma.product.create({
      data: {
        ...product,
        status: ProductStatus.AVAILABLE,
        isAvailable: true,
      },
    })
  }

  console.log('✅ Base de données réinitialisée avec 11 produits !')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })