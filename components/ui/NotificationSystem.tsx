// src/components/ui/NotificationSystem.tsx
'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Info, AlertCircle, X, Bell } from 'lucide-react'

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
  const [hasPermission, setHasPermission] = useState(false)

  // Demander la permission pour les notifications navigateur
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        setHasPermission(permission === 'granted')
      })
    } else if ('Notification' in window && Notification.permission === 'granted') {
      setHasPermission(true)
    }
  }, [])

  // Vérifier le statut de la commande
  useEffect(() => {
    if (!orderId) return

    const checkOrderStatus = async () => {
      try {
        const response = await fetch(`/api/commandes/${orderId}`)
        const { data } = await response.json()

        if (data && data.status !== lastStatus && lastStatus !== null) {
          // Le statut a changé, créer une notification
          const notification = createNotificationFromStatus(data.status, data.orderNumber)
          addNotification(notification)

          // Notification navigateur si autorisé
          if (hasPermission) {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
            })
          }

          // Son de notification
          playNotificationSound()
        }

        setLastStatus(data.status)
      } catch (error) {
        console.error('Erreur vérification statut:', error)
      }
    }

    // Vérifier immédiatement
    checkOrderStatus()

    // Puis vérifier toutes les 15 secondes
    const interval = setInterval(checkOrderStatus, 15000)

    return () => clearInterval(interval)
  }, [orderId, lastStatus, hasPermission])

  const createNotificationFromStatus = (status: string, orderNumber: string): Notification => {
    const notifications: Record<string, { type: 'success' | 'info' | 'warning'; title: string; message: string }> = {
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
        message: `Votre commande ${orderNumber} a été annulée. Contactez-nous pour plus d'informations.`,
      },
    }

    return {
      id: Date.now().toString(),
      timestamp: Date.now(),
      ...(notifications[status] || {
        type: 'info',
        title: 'Mise à jour',
        message: `Le statut de votre commande ${orderNumber} a été mis à jour.`,
      }),
    }
  }

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 5)) // Garder max 5 notifications

    // Retirer automatiquement après 10 secondes
    setTimeout(() => {
      removeNotification(notification.id)
    }, 10000)
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const playNotificationSound = () => {
    // Son simple de notification
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
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
  }

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
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}