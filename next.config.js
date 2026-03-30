/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cocoaandfig.com',
        pathname: '/**',
      },
      {
        // Ajout du protocole http car ton erreur précédente le mentionnait
        protocol: 'http',
        hostname: 'cocoaandfig.com',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig