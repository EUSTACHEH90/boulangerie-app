// src/components/admin/OrderDetailAdmin.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Order } from '@/types'
import Modal from '@/components/ui/Modal'
import Toast from '@/components/ui/Toast'
import { CheckCircle } from 'lucide-react'

interface OrderDetailAdminProps {
  order: Order
}

export default function OrderDetailAdmin({ order }: OrderDetailAdminProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const [adminNotes, setAdminNotes] = useState(order.adminNotes || '')
  
  // État pour la modal de confirmation
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    status: string | null
    statusLabel: string
  }>({
    isOpen: false,
    status: null,
    statusLabel: '',
  })

  // État pour les notifications
  const [toast, setToast] = useState<{
    show: boolean
    type: 'success' | 'error' | 'warning'
    message: string
  }>({
    show: false,
    type: 'success',
    message: '',
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      PENDING: { label: 'En attente', className: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { label: 'Confirmée', className: 'bg-blue-100 text-blue-800' },
      PREPARING: { label: 'En préparation', className: 'bg-orange-100 text-orange-800' },
      READY: { label: 'Prête', className: 'bg-purple-100 text-purple-800' },
      COMPLETED: { label: 'Terminée', className: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'Annulée', className: 'bg-red-100 text-red-800' },
    }
    const badge = badges[status] || badges.PENDING
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badge.className}`}>
        {badge.label}
      </span>
    )
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      CONFIRMED: 'Confirmée',
      PREPARING: 'En préparation',
      READY: 'Prête',
      COMPLETED: 'Terminée',
      CANCELLED: 'Annulée',
    }
    return labels[status] || status
  }

  const openConfirmModal = (status: string) => {
    setConfirmModal({
      isOpen: true,
      status,
      statusLabel: getStatusLabel(status),
    })
  }

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      status: null,
      statusLabel: '',
    })
  }

  const showToast = (type: 'success' | 'error' | 'warning', message: string) => {
    setToast({ show: true, type, message })
  }

  const handleConfirmStatusChange = async () => {
  if (!confirmModal.status) return

  setIsUpdating(true)
  closeConfirmModal()

  try {
    const response = await fetch(`/admin/commandes/${order.id}/update-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: confirmModal.status,
        adminNotes: adminNotes || undefined,
      }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Erreur lors de la mise à jour')
    }

    const data = await response.json()
    showToast('success', data.message || `Commande passée à "${confirmModal.statusLabel}" avec succès`) // ✅ Message personnalisé
    
    setTimeout(() => {
      router.refresh()
    }, 1000)
  } catch (error) {
    showToast('error', error instanceof Error ? error.message : 'Erreur lors de la mise à jour')
  } finally {
    setIsUpdating(false)
  }
}

  return (
    <>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Commande {order.orderNumber}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Passée le {formatDate(order.createdAt)}
              </p>
            </div>
            {getStatusBadge(order.status)}
          </div>

          {/* Actions rapides */}
          <div className="flex flex-wrap gap-2 mt-4">
            {order.status === 'PENDING' && (
              <button
                onClick={() => openConfirmModal('CONFIRMED')}
                disabled={isUpdating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Confirmer la commande
              </button>
            )}
            {order.status === 'CONFIRMED' && (
              <button
                onClick={() => openConfirmModal('PREPARING')}
                disabled={isUpdating}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Commencer la préparation
              </button>
            )}
            {order.status === 'PREPARING' && (
              <button
                onClick={() => openConfirmModal('READY')}
                disabled={isUpdating}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Marquer comme prête
              </button>
            )}
            {order.status === 'READY' && (
              <button
                onClick={() => openConfirmModal('COMPLETED')}
                disabled={isUpdating}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Marquer comme livrée
              </button>
            )}
            {['PENDING', 'CONFIRMED'].includes(order.status) && (
              <button
                onClick={() => openConfirmModal('CANCELLED')}
                disabled={isUpdating}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler la commande
              </button>
            )}
          </div>

          {/* Indicateur de chargement */}
          {isUpdating && (
            <div className="mt-4 flex items-center gap-2 text-amber-600">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-600 border-t-transparent" />
              <span className="text-sm font-medium">Mise à jour en cours...</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Articles */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Articles</h2>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-3 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-500">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">{formatPrice(item.subtotal)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Livraison</span>
                  <span>{formatPrice(order.deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t pt-2">
                  <span>Total</span>
                  <span className="text-amber-600">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Notes admin */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Notes internes</h2>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                placeholder="Ajoutez des notes visibles uniquement par les administrateurs..."
              />
              <p className="text-xs text-gray-500 mt-2">
                Les notes seront enregistrées lors du changement de statut
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Client</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Nom</p>
                  <p className="font-medium text-gray-900">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Téléphone</p>
                  <p className="font-medium text-gray-900">{order.customerPhone}</p>
                </div>
                {order.customerEmail && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                    <p className="font-medium text-gray-900 break-words">{order.customerEmail}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Livraison */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {order.isDelivery ? '🚚 Livraison' : '🏪 Retrait'}
              </h2>
              <div className="space-y-3">
                {order.isDelivery ? (
                  <>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Adresse</p>
                      <p className="text-gray-900">{order.deliveryAddress}</p>
                    </div>
                    {order.deliveryTime && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Heure souhaitée</p>
                        <p className="text-gray-900">{formatDate(order.deliveryTime)}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-600">Le client viendra récupérer sa commande en boutique</p>
                )}
                {order.notes && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-800 uppercase tracking-wide mb-1">Note du client</p>
                    <p className="text-sm text-gray-900">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Paiement */}
            {order.payment && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">💳 Paiement</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Méthode</p>
                    <p className="font-medium text-gray-900">
                      {order.payment.method === 'MOBILE_MONEY' ? 'Mobile Money' : 'Paiement en espèces'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Statut</p>
                    <p
                      className={`font-medium ${
                        order.payment.status === 'COMPLETED'
                          ? 'text-green-600'
                          : order.payment.status === 'FAILED'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      {order.payment.status === 'COMPLETED'
                        ? '✓ Payé'
                        : order.payment.status === 'FAILED'
                        ? '✗ Échec'
                        : order.payment.status === 'PROCESSING'
                        ? '⏳ En cours'
                        : '⏸ En attente'}
                    </p>
                  </div>
                  {order.payment.phoneNumber && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Numéro</p>
                      <p className="font-medium text-gray-900">{order.payment.phoneNumber}</p>
                    </div>
                  )}
                  {order.payment.operator && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Opérateur</p>
                      <p className="font-medium text-gray-900">{order.payment.operator}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmation */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        title="Confirmer le changement de statut"
        footer={
          <>
            <button
              onClick={closeConfirmModal}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirmStatusChange}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium"
            >
              Confirmer
            </button>
          </>
        }
      >
        <p className="text-gray-700">
          Êtes-vous sûr de vouloir passer cette commande au statut{' '}
          <span className="font-semibold text-gray-900">"{confirmModal.statusLabel}"</span> ?
        </p>
        {confirmModal.status === 'CANCELLED' && (
          <p className="text-sm text-red-600 mt-3">
            ⚠️ Cette action annulera la commande et restaurera le stock des produits.
          </p>
        )}
      </Modal>

      {/* Toast notification */}
      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </>
  )
}