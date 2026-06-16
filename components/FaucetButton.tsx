'use client'
import React, { useState } from 'react'
import { useWallet } from '@/context/WalletContext'
import { fundTestnetAccount } from '@/lib/stellar'

type FundState = 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'

export function FaucetButton() {
  const { publicKey, isConnected, refreshBalance } = useWallet()
  const [state, setState] = useState<FundState>('IDLE')

  const handleFund = async () => {
    if (!publicKey) return
    setState('LOADING')
    const success = await fundTestnetAccount(publicKey)
    if (success) {
      setState('SUCCESS')
      await refreshBalance()
      setTimeout(() => setState('IDLE'), 5000)
    } else {
      setState('ERROR')
    }
  }

  if (!isConnected) return null

  return (
    <div className="fade-in">
      {state === 'IDLE' && (
        <button
          onClick={handleFund}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl border-2 border-dashed border-[#E7E5E4] hover:border-[#3730A3] hover:bg-[#EEF2FF] text-sm font-bold text-[#78716C] hover:text-[#3730A3] transition-all group focus:outline-none focus:ring-2 focus:ring-[#3730A3] focus:ring-offset-2"
        >
          <span className="text-lg group-hover:scale-110 transition-transform">🪙</span>
          <div className="text-left">
            <div>Fund with Testnet XLM</div>
            <div className="text-[10px] font-semibold text-[#78716C] group-hover:text-[#3730A3]/70">Get 10,000 free XLM from Friendbot</div>
          </div>
        </button>
      )}

      {state === 'LOADING' && (
        <div className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl border border-[#E7E5E4] bg-[#FAFAF9]">
          <svg className="animate-spin w-4 h-4 text-[#3730A3]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-semibold text-[#78716C]">Contacting Friendbot…</span>
        </div>
      )}

      {state === 'SUCCESS' && (
        <div className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-[#DCFCE7] border border-emerald-200 slide-down">
          <div className="w-9 h-9 rounded-full bg-[#166534] flex items-center justify-center text-white flex-shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold text-[#166534]">Account funded!</div>
            <div className="text-xs font-semibold text-[#166534]/80">+10,000 XLM added to your wallet</div>
          </div>
        </div>
      )}

      {state === 'ERROR' && (
        <div className="w-full rounded-xl bg-[#FEE2E2] border border-red-200 overflow-hidden slide-down">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-9 h-9 rounded-full bg-[#991B1B] flex items-center justify-center text-white flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-[#991B1B]">Funding failed</div>
              <div className="text-xs font-semibold text-[#991B1B]/70">Account may already be funded</div>
            </div>
            <button
              onClick={() => setState('IDLE')}
              className="text-xs font-bold text-[#991B1B] hover:underline flex-shrink-0"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
