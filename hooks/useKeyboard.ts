'use client'
import { useEffect } from 'react'

export function useKeyboard(onOpenWallet: () => void, onCloseModals: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onOpenWallet()
      }
      
      // Escape
      if (e.key === 'Escape') {
        onCloseModals()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onOpenWallet, onCloseModals])
}
