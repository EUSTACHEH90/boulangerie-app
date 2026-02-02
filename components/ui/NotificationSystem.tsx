// src/components/ui/NotificationSystem.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, Info, AlertCircle, X } from 'lucide-react'

interface Notification {
  id: string
  type: 'success' | 'info' | 'warning'
  title: string
  message: string
  timestamp: number
}

interface NotificationSystemProps {
  orderId?: string
}

export default function NotificationSystem({ orderId }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [lastStatus, setLastStatus] = useState<string | null>(null)
  
  // ✅ Initialiser avec une fonction au lieu de useEffect
  const [hasPermission, setHasPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted'
    }
    return false
  })

  const playNotificationSound = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContextClass) return

      const audioContext = new AudioContextClass()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.warn('Audio notification non disponible')
    }
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 5))
    setTimeout(() => removeNotification(notification.id), 10000)
  }, [removeNotification])

  const createNotificationFromStatus = useCallback((status: string, orderNumber: string): Notification => {
    const notificationMap: Record<string, { type: 'success' | 'info' | 'warning'; title: string; message: string }> = {
      CONFIRMED: {
        type: 'success',
        title: '✓ Commande confirmée',
        message: `Votre commande ${orderNumber} a été confirmée et va être préparée !`,
      },
      PREPARING: {
        type: 'info',
        title: '👨‍🍳 Préparation en cours',
        message: `Nos boulangers préparent votre commande ${orderNumber} avec soin.`,
      },
      READY: {
        type: 'success',
        title: '✓ Commande prête',
        message: `Votre commande ${orderNumber} est prête ! Vous pouvez venir la récupérer.`,
      },
      COMPLETED: {
        type: 'success',
        title: '🎉 Commande terminée',
        message: `Merci pour votre commande ${orderNumber} ! À bientôt.`,
      },
      CANCELLED: {
        type: 'warning',
        title: '⚠️ Commande annulée',
        message: `Votre commande ${orderNumber} a été annulée.`,
      },
    }

    return {
      id: Date.now().toString(),
      timestamp: Date.now(),
      ...(notificationMap[status] || {
        type: 'info',
        title: 'Mise à jour',
        message: `Le statut de votre commande ${orderNumber} a été mis à jour.`,
      }),
    }
  }, [])

  // ✅ Demander permission uniquement au premier render
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          setHasPermission(true)
        }
      })
    }
  }, [])

  useEffect(() => {
    if (!orderId) return

    let mounted = true

    const checkOrderStatus = async () => {
      try {
        const response = await fetch(`/api/commandes/${orderId}`)
        const { data } = await response.json()

        if (!mounted) return

        if (data && data.status !== lastStatus && lastStatus !== null) {
          const notification = createNotificationFromStatus(data.status, data.orderNumber)
          addNotification(notification)

          if (hasPermission) {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/favicon.ico',
            })
          }

          playNotificationSound()
        }

        if (mounted) {
          setLastStatus(data.status)
        }
      } catch (error) {
        console.error('Erreur vérification statut:', error)
      }
    }

    checkOrderStatus()
    const interval = setInterval(checkOrderStatus, 15000)
    
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [orderId, lastStatus, hasPermission, createNotificationFromStatus, addNotification, playNotificationSound])

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6" />
      case 'warning':
        return <AlertCircle className="w-6 h-6" />
      default:
        return <Info className="w-6 h-6" />
    }
  }

  const getColors = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getColors(notification.type)} border-2 rounded-lg shadow-lg p-4 animate-in slide-in-from-top-5 duration-300`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm mb-1">
                {notification.title}
              </p>
              <p className="text-sm opacity-90">
                {notification.message}
              </p>
              <p className="text-xs opacity-60 mt-2">
                {new Date(notification.timestamp).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 hover:opacity-70 transition"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}