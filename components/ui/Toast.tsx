'use client'
import React, { useState, useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastMsg {
  id: string
  type: ToastType
  message: string
}

export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastMsg[]>([])

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ type: ToastType; message: string }>
      const id = Math.random().toString(36).substr(2, 9)
      setToasts(prev => [...prev.slice(-2), { id, ...customEvent.detail }])
      
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 4000)
    }

    window.addEventListener('toast', handleToast)
    return () => window.removeEventListener('toast', handleToast)
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => {
        let colors = ''
        let icon = null
        if (toast.type === 'success') {
          colors = 'bg-[#F0FDF4] border-[#15803D] text-[#15803D]'
          icon = <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        } else if (toast.type === 'error') {
          colors = 'bg-[#FFF5F5] border-[#B91C1C] text-[#B91C1C]'
          icon = <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        } else if (toast.type === 'warning') {
          colors = 'bg-[#FFFBEB] border-[#B45309] text-[#B45309]'
          icon = <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        } else {
          colors = 'bg-[#EEF2FF] border-[#4338CA] text-[#4338CA]'
          icon = <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        }

        return (
          <div key={toast.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border pointer-events-auto shadow-lg stagger-in ${colors}`}>
            {icon}
            <span className="text-sm font-bold">{toast.message}</span>
            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="ml-2 opacity-50 hover:opacity-100 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )
      })}
    </div>
  )
}

export function showToast(type: ToastType, message: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('toast', { detail: { type, message } }))
  }
}
