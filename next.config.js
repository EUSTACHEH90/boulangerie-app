/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  // ✅ Désactiver ESLint pendant le build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // ✅ Désactiver TypeScript strict pendant le build (optionnel)
  typescript: {
    ignoreBuildErrors: false, // Laissez à false pour garder la vérification TypeScript
  },
}

module.exports = nextConfig