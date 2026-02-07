// app/(clients)/a-propos/page.tsx

import Image from 'next/image'

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            À Propos de Ma Boulangerie
          </h1>
          <p className="text-xl text-gray-600">
            Artisan boulanger depuis 1990
          </p>
        </div>

        {/* Histoire */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="text-5xl">🥖</div>
            <h2 className="text-2xl font-bold text-gray-900">Notre Histoire</h2>
          </div>
          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="mb-4">
              Depuis plus de 30 ans, Ma Boulangerie est au service des habitants de Ouagadougou 
              pour leur offrir le meilleur du pain artisanal et des pâtisseries françaises.
            </p>
            <p className="mb-4">
              Fondée en 1990 par un passionné de boulangerie traditionnelle, notre établissement 
              s&apos;est donné pour mission de perpétuer le savoir-faire artisanal tout en s&apos;adaptant 
              aux goûts et besoins de notre clientèle.
            </p>
            <p>
              Chaque jour, nos boulangers se lèvent avant l&apos;aube pour préparer avec amour et 
              expertise des produits frais qui raviront vos papilles.
            </p>
          </div>
        </div>

        {/* Nos valeurs */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="text-5xl">⭐</div>
            <h2 className="text-2xl font-bold text-gray-900">Nos Valeurs</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-amber-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg text-amber-900 mb-2">Qualité</h3>
              <p className="text-gray-700">
                Nous sélectionnons rigoureusement nos ingrédients et suivons des recettes 
                traditionnelles pour garantir la qualité de nos produits.
              </p>
            </div>
            <div className="bg-amber-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg text-amber-900 mb-2">Fraîcheur</h3>
              <p className="text-gray-700">
                Tous nos produits sont préparés quotidiennement, sans conservateurs, 
                pour vous offrir une fraîcheur incomparable.
              </p>
            </div>
            <div className="bg-amber-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg text-amber-900 mb-2">Savoir-faire</h3>
              <p className="text-gray-700">
                Notre équipe de boulangers formés perpétue les techniques artisanales 
                de la boulangerie française.
              </p>
            </div>
            <div className="bg-amber-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg text-amber-900 mb-2">Service</h3>
              <p className="text-gray-700">
                Votre satisfaction est notre priorité. Nous sommes à votre écoute 
                pour répondre à vos besoins.
              </p>
            </div>
          </div>
        </div>

        {/* Horaires */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="text-5xl">🕐</div>
            <h2 className="text-2xl font-bold text-gray-900">Horaires d&apos;ouverture</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between py-3 border-b">
              <span className="font-semibold text-gray-900">Lundi - Vendredi</span>
              <span className="text-gray-600">6h00 - 20h00</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="font-semibold text-gray-900">Samedi</span>
              <span className="text-gray-600">6h00 - 20h00</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="font-semibold text-gray-900">Dimanche</span>
              <span className="text-gray-600">7h00 - 14h00</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="font-semibold text-gray-900">Jours fériés</span>
              <span className="text-gray-600">7h00 - 12h00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}