// src/lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// ✅ Ajouter le helper
export async function testDatabaseConnection() {
  try {
    await prisma.$connect()
    await prisma.$disconnect()
    return true
  } catch (err) {
    console.error('Database connection failed:', err)
    return false
  }
}

export default prisma
