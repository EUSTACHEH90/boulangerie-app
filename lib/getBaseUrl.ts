export function getBaseUrl() {
  // Navigateur
  if (typeof window !== 'undefined') {
    return ''
  }

  // Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Local
  return 'http://localhost:3000'
}
