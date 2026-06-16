'use client'
import React, { useState, useEffect } from 'react'
import { Horizon } from '@stellar/stellar-sdk'

const server = new Horizon.Server('https://horizon-testnet.stellar.org')

export function NetworkBanner() {
  const [ledger, setLedger] = useState<number | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        const root = await server.root()
        setLedger(root.history_latest_ledger)
        setError(false)
      } catch (e) {
        setError(true)
      }
    }

    fetchLedger()
    const interval = setInterval(fetchLedger, 5000)
    return () => clearInterval(interval)
  }, [])

  if (error) {
    return (
      <div className="w-full bg-[#FFF5F5] text-[#B91C1C] text-xs py-1.5 px-4 flex items-center justify-center font-bold tracking-wide z-50 relative border-b border-[#B91C1C]/20">
        Stellar Testnet is experiencing issues
      </div>
    )
  }

  return (
    <div className="w-full bg-[#EEF2FF] text-[#4338CA] text-[11px] py-1.5 px-4 flex items-center justify-between font-bold z-50 relative border-b border-[#4338CA]/10 tracking-wide uppercase">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-dot" />
        Stellar Testnet
      </div>
      <div>
        {ledger ? `Ledger: ${ledger.toLocaleString()}` : 'Syncing...'}
      </div>
    </div>
  )
}
