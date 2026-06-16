'use client'
import React, { useState, useEffect, useCallback } from 'react'
import confetti from 'canvas-confetti'
import { getCount, callIncrement } from '@/lib/soroban'
import { useWallet } from '@/context/WalletContext'
import { UserRejectedError } from '@/lib/errors'

export function ContractCounter() {
  const { publicKey, isConnected } = useWallet()
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [isFlipping, setIsFlipping] = useState(false)
  const [lastCount, setLastCount] = useState<number | null>(null)

  const fetchCount = useCallback(async () => {
    try {
      const c = await getCount()
      setCount(prev => {
        if (prev !== null && prev !== c) {
          setIsFlipping(true)
          setTimeout(() => setIsFlipping(false), 600)
        }
        return c
      })
      setLastCount(c)
      setError(null)
    } catch (err: any) {
      console.error('[ContractCounter] getCount error:', err)
      setError(err?.message || 'Failed to fetch count')
    }
  }, [])

  useEffect(() => {
    fetchCount()
    const interval = setInterval(fetchCount, 8000)
    return () => clearInterval(interval)
  }, [fetchCount])

  const handleIncrement = async () => {
    if (!publicKey) return
    setLoading(true)
    setError(null)
    setTxHash(null)
    try {
      const result = await callIncrement(publicKey)
      if (result && result.txHash) {
        setTxHash(result.txHash)
        setCount(result.count)
        
        const btn = document.getElementById('increment-btn')
        if (btn) {
          const rect = btn.getBoundingClientRect()
          const x = (rect.left + rect.width / 2) / window.innerWidth
          const y = (rect.top + rect.height / 2) / window.innerHeight
          confetti({ particleCount: 80, spread: 60, origin: { x, y }, colors: ['#4338CA', '#7C3AED', '#EEF2FF'] })
        }
      } else {
        setError('Transaction failed — no hash returned')
      }
    } catch (err: any) {
      if (err instanceof UserRejectedError) {
        setError('Transaction rejected in wallet.')
      } else {
        setError(err?.message || 'Error executing contract')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`premium-card p-6 overflow-hidden relative transition-colors duration-500 ${txHash && !loading ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]' : ''}`}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#EEF2FF_0%,_transparent_70%)] opacity-30 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h3 className="text-xl font-black text-[var(--text-primary)]">Contract Counter</h3>
          <p className="text-xs text-[var(--text-secondary)] font-bold mt-1">Soroban Smart Contract</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F0FDF4] border border-[#15803D]/20 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] live-dot" />
          <span className="text-[9px] font-black text-[var(--success)] uppercase tracking-wider">Live</span>
        </div>
      </div>

      {/* Count Display */}
      <div className="flex flex-col items-center justify-center py-8 relative z-10">
        {count === null && !error ? (
          <div className="h-[120px] flex flex-col items-center justify-center gap-3">
            <div className="circle-spinner w-8 h-8 text-[var(--accent)]" />
            <p className="text-xs font-bold text-[var(--text-hint)]">Connecting to Soroban…</p>
          </div>
        ) : count !== null ? (
          <div className={`text-8xl md:text-9xl font-black text-gradient tracking-tighter select-none ${isFlipping ? 'count-flip' : ''}`}>
            {count}
          </div>
        ) : null}

        {count !== null && (
          <p className="text-xs text-[var(--text-hint)] font-bold mt-3 tracking-wide uppercase">
            Global on-chain count
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 relative z-10">
          <div className="text-[11px] font-bold text-[var(--error)] bg-[var(--error-light)] px-3 py-2.5 rounded-lg border border-[var(--error)]/20 text-center leading-relaxed">
            {error}
          </div>
          <button
            onClick={fetchCount}
            className="w-full mt-2 text-[10px] font-black uppercase tracking-widest text-[var(--accent)] hover:bg-[var(--accent-light)] py-1.5 rounded-lg transition-colors"
          >
            ↻ Retry
          </button>
        </div>
      )}

      {/* TX Hash link */}
      {txHash && !loading && !error && (
        <div className="mb-4 text-center relative z-10">
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-[var(--accent)] hover:text-[var(--accent-hover)] underline transition-colors"
          >
            View confirmation on Explorer →
          </a>
        </div>
      )}

      {/* Increment Button */}
      <button
        id="increment-btn"
        onClick={handleIncrement}
        disabled={loading || !isConnected}
        className="btn-press btn-primary-glow relative z-10 w-full py-4 px-4 rounded-xl text-sm font-black text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-[var(--accent)]/20"
      >
        {loading ? (
          <>
            <div className="circle-spinner" />
            Signing &amp; Sending…
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {isConnected ? 'Increment Count' : 'Connect Wallet to Increment'}
          </>
        )}
      </button>

      {/* Contract link */}
      <div className="mt-4 text-center relative z-10">
        <a
          href={`https://stellar.expert/explorer/testnet/contract/${COUNTER_CONTRACT_ID}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-bold text-[var(--text-hint)] hover:text-[var(--text-secondary)] transition-colors uppercase tracking-widest inline-flex items-center gap-1"
        >
          View Contract Source
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  )
}

const COUNTER_CONTRACT_ID = 'CDSDF3RZZ4TH2X2N4KJDT72P3AF2A4CLCVN3SXOKHUJ22SC7ZQIDQTFC'
