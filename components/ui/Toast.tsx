// src/components/ui/Toast.tsx
'use client'

import { useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

interface ToastProps {
  type: 'success' | 'error' | 'warning'
  message: string
  onClose: () => void
  duration?: number
}

export default function Toast({ type, message, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
  }

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${colors[type]} min-w-[300px]`}>
        {icons[type]}
        <p className="flex-1 font-medium">{message}</p>
        <button
          onClick={onClose}
          className="hover:opacity-70 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}