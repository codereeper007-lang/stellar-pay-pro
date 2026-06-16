'use client'
import React, { useState, useEffect } from 'react'
import { useWallet } from '@/context/WalletContext'
import { Badge } from '@/components/ui/Badge'
import { SkeletonText } from '@/components/ui/Skeleton'

export function BalanceCard() {
  const { balance, network, isLoading, refreshBalance } = useWallet()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [displayBalance, setDisplayBalance] = useState(0)

  useEffect(() => {
    if (balance) {
      const target = parseFloat(balance)
      const duration = 800
      const startTime = performance.now()
      const startVal = displayBalance

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        // easeOutQuart
        const ease = 1 - Math.pow(1 - progress, 4)
        setDisplayBalance(startVal + (target - startVal) * ease)
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setDisplayBalance(target)
        }
      }
      requestAnimationFrame(animate)
    }
  }, [balance])

  const handleRefresh = async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    try { await refreshBalance() } finally { setTimeout(() => setIsRefreshing(false), 500) }
  }

  const usdValue = (parseFloat(balance || '0') * 0.1).toFixed(2)
  const formatted = displayBalance.toFixed(4)
  const [whole, decimal] = formatted.split('.')

  return (
    <div className="premium-card card-ambient p-6 relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(ellipse_at_top_right,_var(--accent-glow)_0%,_transparent_70%)] opacity-20 transition-opacity group-hover:opacity-40" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center">
            <svg className="w-4 h-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
          </div>
          <span className="text-xs font-bold text-[var(--text-secondary)] tracking-widest uppercase">XLM Balance</span>
        </div>
        <Badge variant="neutral">{network}</Badge>
      </div>

      <div className="relative z-10">
        {isLoading ? (
          <div className="space-y-3">
            <SkeletonText className="w-3/4 h-10" />
            <SkeletonText className="w-1/3 h-4" />
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight">{whole}</span>
              <span className="text-xl font-bold text-[var(--text-hint)]">.{decimal}</span>
              <span className="text-base font-bold text-[var(--text-secondary)] ml-1">XLM</span>
            </div>
            <div className="text-sm font-semibold text-[var(--text-hint)] flex items-center gap-1.5">
              ≈ ${usdValue} USD 
              <span className="text-[10px] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded font-bold">@ 0.10/XLM</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-8 pt-4 border-t border-[var(--border-soft)] relative z-10">
        <span className="text-[11px] font-bold text-[var(--text-hint)] uppercase tracking-wider">
          Last updated just now
        </span>
        <button 
          onClick={handleRefresh}
          aria-label="Refresh balance"
          disabled={isRefreshing || isLoading}
          className="p-2 text-[var(--text-hint)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        >
          <svg className={`w-4 h-4 ${isRefreshing ? 'rotate-360 transition-transform duration-500' : 'transition-transform duration-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  )
}
