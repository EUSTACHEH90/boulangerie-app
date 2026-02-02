// scripts/check-db.ts
import { testDatabaseConnection } from '@/lib/db'

async function main() {
  const isConnected = await testDatabaseConnection()
  
  if (isConnected) {
    console.log('✅ Connexion à la base de données réussie')
    process.exit(0)
  } else {
    console.log('❌ Impossible de se connecter à la base de données')
    process.exit(1)
  }
}

main()