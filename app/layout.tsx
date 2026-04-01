// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Boulagerie App",
  description: "Application web d'une boulangerie artisanale avec gestion de produits, commandes et clients",
  keywords: ["patisserie", "boulangerie", "web app", "next.js", "prisma", "typescript"],
  authors: [{ name: "Eustache" }],
  creator: "Eustache",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
