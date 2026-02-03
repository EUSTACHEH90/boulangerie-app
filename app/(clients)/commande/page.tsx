// src/app/(clients)/commande/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store/cartStore'

export default function CommandePage() {
  const router = useRouter()
  const { items, getTotalPrice, getTotalItems, clearCart } = useCartStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    isDelivery: false,
    deliveryAddress: '',
    deliveryTime: '',
    notes: '',
    paymentMethod: 'CASH' as 'CASH' | 'MOBILE_MONEY',
    phoneNumber: '',
    operator: '',
  })

  // Style pour les inputs avec visibilité garantie
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    color: '#111827',
    backgroundColor: '#ffffff',
    border: '2px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
  }

  const inputFocusStyle: React.CSSProperties = {
    ...inputStyle,
    borderColor: '#f59e0b',
    boxShadow: '0 0 0 3px rgba(245, 158, 11, 0.1)',
  }

  useEffect(() => {
    if (items.length === 0) {
      router.push('/panier')
    }
  }, [items, router])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const deliveryFee = formData.isDelivery ? 2000 : 0
  const total = getTotalPrice() + deliveryFee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const orderData = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail || undefined,
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        isDelivery: formData.isDelivery,
        deliveryAddress: formData.isDelivery ? formData.deliveryAddress : undefined,
        deliveryTime: formData.deliveryTime || undefined,
        notes: formData.notes || undefined,
        paymentMethod: formData.paymentMethod,
        phoneNumber: formData.paymentMethod === 'MOBILE_MONEY' ? formData.phoneNumber : undefined,
        operator: formData.paymentMethod === 'MOBILE_MONEY' ? formData.operator : undefined,
      }

      const response = await fetch('/api/commandes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la commande')
      }

      clearCart()
      router.push(`/commande/${data.data.id}/success`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '2rem' }}>
          Finaliser ma commande
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Informations client */}
              <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
                  Vos informations
                </h2>

                {error && (
                  <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: '8px' }}>
                    {error}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      style={inputStyle}
                      placeholder="Ex: Jean Dupont"
                      onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                      onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      style={inputStyle}
                      placeholder="+226 70 12 34 56"
                      onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                      onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      Email (optionnel)
                    </label>
                    <input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      style={inputStyle}
                      placeholder="email@example.com"
                      onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                      onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                    />
                  </div>
                </div>
              </div>

              {/* Livraison */}
              <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
                  Mode de récupération
                </h2>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <label style={{ 
                    flex: 1, 
                    cursor: 'pointer',
                    padding: '1rem',
                    border: formData.isDelivery ? '2px solid #d1d5db' : '2px solid #f59e0b',
                    backgroundColor: formData.isDelivery ? 'white' : '#fef3c7',
                    borderRadius: '8px'
                  }}>
                    <input
                      type="radio"
                      name="delivery"
                      checked={!formData.isDelivery}
                      onChange={() => setFormData({ ...formData, isDelivery: false })}
                      style={{ display: 'none' }}
                    />
                    <p style={{ fontWeight: 'bold', color: '#111827' }}>🏪 Retrait en boutique</p>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '0.25rem' }}>Gratuit</p>
                  </label>

                  <label style={{ 
                    flex: 1, 
                    cursor: 'pointer',
                    padding: '1rem',
                    border: formData.isDelivery ? '2px solid #f59e0b' : '2px solid #d1d5db',
                    backgroundColor: formData.isDelivery ? '#fef3c7' : 'white',
                    borderRadius: '8px'
                  }}>
                    <input
                      type="radio"
                      name="delivery"
                      checked={formData.isDelivery}
                      onChange={() => setFormData({ ...formData, isDelivery: true })}
                      style={{ display: 'none' }}
                    />
                    <p style={{ fontWeight: 'bold', color: '#111827' }}>🚚 Livraison à domicile</p>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '0.25rem' }}>2 000 FCFA</p>
                  </label>
                </div>

                {formData.isDelivery && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                        Adresse de livraison *
                      </label>
                      <textarea
                        required={formData.isDelivery}
                        value={formData.deliveryAddress}
                        onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                        rows={3}
                        style={inputStyle}
                        placeholder="Secteur, rue, indication..."
                        onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                        onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                        Heure de livraison souhaitée
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.deliveryTime}
                        onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                        style={inputStyle}
                        onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                        onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                      />
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Notes (optionnel)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    style={inputStyle}
                    placeholder="Instructions particulières..."
                    onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                    onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                  />
                </div>
              </div>

              {/* Paiement */}
              <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
                  Mode de paiement
                </h2>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <label style={{ 
                    flex: 1, 
                    cursor: 'pointer',
                    padding: '1rem',
                    border: formData.paymentMethod === 'CASH' ? '2px solid #f59e0b' : '2px solid #d1d5db',
                    backgroundColor: formData.paymentMethod === 'CASH' ? '#fef3c7' : 'white',
                    borderRadius: '8px'
                  }}>
                    <input
                      type="radio"
                      name="payment"
                      checked={formData.paymentMethod === 'CASH'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'CASH' })}
                      style={{ display: 'none' }}
                    />
                    <p style={{ fontWeight: 'bold', color: '#111827' }}>💵 Espèces</p>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '0.25rem' }}>À la livraison</p>
                  </label>

                  <label style={{ 
                    flex: 1, 
                    cursor: 'pointer',
                    padding: '1rem',
                    border: formData.paymentMethod === 'MOBILE_MONEY' ? '2px solid #f59e0b' : '2px solid #d1d5db',
                    backgroundColor: formData.paymentMethod === 'MOBILE_MONEY' ? '#fef3c7' : 'white',
                    borderRadius: '8px'
                  }}>
                    <input
                      type="radio"
                      name="payment"
                      checked={formData.paymentMethod === 'MOBILE_MONEY'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'MOBILE_MONEY' })}
                      style={{ display: 'none' }}
                    />
                    <p style={{ fontWeight: 'bold', color: '#111827' }}>📱 Mobile Money</p>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '0.25rem' }}>Orange, Moov, MTN</p>
                  </label>
                </div>

                {formData.paymentMethod === 'MOBILE_MONEY' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                        Opérateur *
                      </label>
                      <select
                        required
                        value={formData.operator}
                        onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                        style={inputStyle}
                        onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                        onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                      >
                        <option value="">Choisir un opérateur</option>
                        <option value="Orange">Orange Money</option>
                        <option value="Moov">Moov Money</option>
                        <option value="MTN">MTN Mobile Money</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                        Numéro Mobile Money *
                      </label>
                      <input
                        type="tel"
                        required={formData.paymentMethod === 'MOBILE_MONEY'}
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        style={inputStyle}
                        placeholder="+226 70 12 34 56"
                        onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                        onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Récapitulatif */}
            <div>
              <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem', position: 'sticky', top: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
                  Récapitulatif
                </h2>

                <div style={{ marginBottom: '1rem' }}>
                  {items.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#6b7280' }}>
                        {item.quantity}x {item.name}
                      </span>
                      <span style={{ fontWeight: 'bold', color: '#111827' }}>
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', marginBottom: '0.5rem' }}>
                    <span>Sous-total</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', marginBottom: '0.5rem' }}>
                    <span>Livraison</span>
                    <span>{formatPrice(deliveryFee)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', borderTop: '1px solid #e5e7eb', paddingTop: '0.5rem' }}>
                    <span style={{ color: '#111827' }}>Total</span>
                    <span style={{ color: '#f59e0b' }}>{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    marginTop: '1.5rem',
                    backgroundColor: isSubmitting ? '#9ca3af' : '#f59e0b',
                    color: 'white',
                    padding: '1rem',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontSize: '16px'
                  }}
                >
                  {isSubmitting ? 'Traitement...' : 'Confirmer la commande'}
                </button>

                <p style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', marginTop: '1rem' }}>
                  En confirmant, vous acceptez nos conditions de vente
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}