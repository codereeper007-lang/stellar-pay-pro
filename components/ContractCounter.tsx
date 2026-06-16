'use client'
import React, { useState, useEffect } from 'react'
import confetti from 'canvas-confetti'
import { getCount, callIncrement } from '@/lib/soroban'
import { useWallet } from '@/context/WalletContext'
import { UserRejectedError } from '@/lib/errors'

export function ContractCounter() {
  const { publicKey } = useWallet()
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [isFlipping, setIsFlipping] = useState(false)

  const fetchCount = async () => {
    try {
      const c = await getCount()
      if (c !== count && count !== null) {
        setIsFlipping(true)
        setTimeout(() => setIsFlipping(false), 500)
      }
      setCount(c)
    } catch {
      setError('Failed to fetch count')
    }
  }

  useEffect(() => {
    fetchCount()
    const int = setInterval(fetchCount, 5000)
    return () => clearInterval(int)
  }, [count])

  const handleIncrement = async () => {
    if (!publicKey) return
    setLoading(true)
    setError(null)
    setTxHash(null)
    try {
      const result = await callIncrement(publicKey)
      if (result && result.txHash) {
        setTxHash(result.txHash)
        
        // Confetti burst
        const btn = document.getElementById('increment-btn')
        if (btn) {
          const rect = btn.getBoundingClientRect()
          const x = (rect.left + rect.width / 2) / window.innerWidth
          const y = (rect.top + rect.height / 2) / window.innerHeight
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { x, y },
            colors: ['#4338CA', '#7C3AED', '#EEF2FF']
          })
        }
        
        await fetchCount()
      } else {
        setError('Transaction failed')
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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--accent-glow)_0%,_transparent_70%)] opacity-5 animate-pulse pointer-events-none" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h3 className="text-xl font-black text-[var(--text-primary)]">Contract Counter</h3>
          <p className="text-xs text-[var(--text-secondary)] font-bold mt-1">Soroban Smart Contract</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F0FDF4] border border-[#15803D]/20 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] live-dot" />
          <span className="text-[9px] font-black text-[var(--success)] uppercase tracking-wider">Live</span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-6 relative z-10">
        {count === null ? (
          <div className="h-[120px] flex items-center justify-center">
            <div className="circle-spinner w-8 h-8 text-[var(--accent)]" />
          </div>
        ) : (
          <div className={`text-8xl md:text-9xl font-black text-gradient tracking-tighter ${isFlipping ? 'count-flip' : ''}`}>
            {count}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 text-[11px] font-bold text-[var(--error)] bg-[var(--error-light)] px-3 py-2 rounded-lg border border-[var(--error)]/20 text-center">
          {error}
        </div>
      )}

      {txHash && !loading && !error && (
        <div className="mb-4 text-center">
          <a href={`https://stellar.expert/explorer/testnet/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-[var(--accent)] hover:text-[var(--accent-hover)] underline transition-colors">
            View confirmation on Explorer &rarr;
          </a>
        </div>
      )}

      <button
        id="increment-btn"
        onClick={handleIncrement}
        disabled={loading || count === null || !publicKey}
        className="btn-press btn-primary-glow relative z-10 w-full py-4 px-4 rounded-xl text-sm font-black text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="circle-spinner" />
            Signing...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Increment Count
          </>
        )}
      </button>

      <div className="mt-4 text-center relative z-10">
        <a 
          href={`https://stellar.expert/explorer/testnet/contract/${process.env.NEXT_PUBLIC_COUNTER_CONTRACT_ID}`}
          target="_blank" rel="noopener noreferrer"
          className="text-[10px] font-bold text-[var(--text-hint)] hover:text-[var(--text-secondary)] transition-colors uppercase tracking-widest inline-flex items-center gap-1"
        >
          View Contract Source
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
        </a>
      </div>
    </div>
  )
}
