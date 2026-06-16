'use client'
import React, { useState, useEffect } from 'react'
import { useWallet } from '@/context/WalletContext'
import { Skeleton } from './ui/Skeleton'

export function BalanceCard() {
  const { balance, isConnected, network, refreshBalance } = useWallet()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(Date.now())
  const [secondsAgo, setSecondsAgo] = useState(0)

  useEffect(() => {
    setLastUpdated(Date.now())
    setSecondsAgo(0)
  }, [balance])

  useEffect(() => {
    const t = setInterval(() => setSecondsAgo(Math.floor((Date.now() - lastUpdated) / 1000)), 1000)
    return () => clearInterval(t)
  }, [lastUpdated])

  const handleRefresh = async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    try { await refreshBalance() } finally { setIsRefreshing(false) }
  }

  const usdValue = (parseFloat(balance || '0') * 0.1).toFixed(2)
  const [whole, dec] = (balance || '0.0000').split('.')

  if (!isConnected) return null

  return (
    <div className="premium-card overflow-hidden fade-in">
      {/* Gradient accent top bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#3730A3] via-[#4F46E5] to-[#6D28D9]" />

      <div className="p-6">
        {/* Top row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-[#3730A3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-[#78716C]">XLM Balance</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EEF2FF] text-[10px] font-black text-[#3730A3] tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3730A3] animate-pulse" />
            {network}
          </span>
        </div>

        {/* Balance amount */}
        {isRefreshing ? (
          <div className="space-y-2 mb-5">
            <Skeleton className="w-48 h-12" />
            <Skeleton className="w-24 h-5" />
          </div>
        ) : (
          <div className="mb-5">
            <div className="flex items-baseline gap-1.5 stat-number">
              <span className="text-5xl font-black text-[#1C1917] leading-none">{whole}</span>
              {dec && (
                <span className="text-2xl font-bold text-[#78716C]">.{dec}</span>
              )}
              <span className="text-lg font-bold text-[#78716C] ml-1">XLM</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-xs font-semibold text-[#78716C]">≈ ${usdValue} USD</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700">~$0.10/XLM</span>
            </div>
          </div>
        )}

        {/* Progress bar (visual, not meaningful) */}
        <div className="h-1 w-full bg-[#F5F5F4] rounded-full overflow-hidden mb-5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#3730A3] to-[#4F46E5] transition-all duration-700"
            style={{ width: `${Math.min(100, (parseFloat(balance) / 10000) * 100)}%` }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#78716C] font-semibold">
            {isRefreshing
              ? 'Refreshing…'
              : secondsAgo === 0
              ? 'Just updated'
              : `Updated ${secondsAgo}s ago`}
          </span>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-1.5 rounded-lg text-[#78716C] hover:text-[#3730A3] hover:bg-[#EEF2FF] transition-all focus:outline-none disabled:opacity-40 ${
              isRefreshing ? 'animate-spin pointer-events-none' : ''
            }`}
            aria-label="Refresh balance"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.228 9H18.01" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
