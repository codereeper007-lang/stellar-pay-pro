'use client'
import React, { useState } from 'react'
import { useWallet } from '@/context/WalletContext'
import { copyToClipboard } from '@/lib/clipboard'
import { callSplitter } from '@/lib/soroban'
import confetti from 'canvas-confetti'

type Token = 'XLM' | 'SDT'

export function PaymentSplitter() {
  const { isConnected, publicKey } = useWallet()
  const [token, setToken] = useState<Token>('XLM')
  const [total, setTotal] = useState('')
  const [recipients, setRecipients] = useState<string[]>(['', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  
  const numTotal = parseFloat(total || '0')
  const share = recipients.length > 0 ? numTotal / recipients.length : 0

  const addRecipient = () => {
    if (recipients.length < 10) setRecipients([...recipients, ''])
  }

  const removeRecipient = (index: number) => {
    if (recipients.length > 2) {
      setRecipients(prev => prev.filter((_, i) => i !== index))
    }
  }

  const updateRecipient = (index: number, val: string) => {
    setRecipients(prev => {
      const copy = [...prev]
      copy[index] = val
      return copy
    })
  }

  const handleSubmit = async () => {
    if (!publicKey || numTotal <= 0 || recipients.some(r => r.length < 56)) return
    
    setLoading(true)
    setError(null)
    setTxHash(null)
    
    try {
      const { txHash } = await callSplitter(publicKey, token, recipients, numTotal.toString())
      setTxHash(txHash)
      
      const btn = document.getElementById('split-btn')
      if (btn) {
        const rect = btn.getBoundingClientRect()
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight },
          colors: ['#3730A3', '#818CF8', '#10B981']
        })
      }
      
      setTotal('')
      setRecipients(['', ''])
    } catch (err: any) {
      setError(err?.message || 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`premium-card card-ambient p-6 h-full flex flex-col transition-colors duration-500 ${txHash && !loading ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]' : ''}`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-[var(--text-primary)]">Split Payment</h3>
          <p className="text-xs text-[var(--text-secondary)] font-bold mt-1">Divide equally between multiple addresses</p>
        </div>
      </div>

      <div className="space-y-6 flex-1 flex flex-col">
        {/* Token Selector & Total */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Sliding pill toggle */}
          <div className="relative flex p-1 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-soft)] w-[140px]">
            <div 
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm border border-[var(--border-soft)] transition-all duration-300 ease-out"
              style={{ left: token === 'XLM' ? '4px' : '50%' }}
            />
            <button 
              onClick={() => setToken('XLM')}
              className={`relative z-10 flex-1 py-2 text-xs font-black tracking-wider transition-colors ${token === 'XLM' ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              XLM
            </button>
            <button 
              onClick={() => setToken('SDT')}
              className={`relative z-10 flex-1 py-2 text-xs font-black tracking-wider transition-colors ${token === 'SDT' ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              SDT
            </button>
          </div>

          <div className="relative flex-1 w-full">
            <input 
              type="number"
              value={total}
              onChange={e => setTotal(e.target.value)}
              placeholder="0.00"
              className="input-stellar text-lg font-bold pr-16"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-[var(--text-hint)]">{token}</div>
          </div>
        </div>

        {/* Recipients List */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[var(--text-hint)] uppercase tracking-wider">Recipients ({recipients.length}/10)</span>
            <button 
              onClick={addRecipient}
              disabled={recipients.length >= 10}
              className="text-[10px] font-black uppercase tracking-wider text-[var(--accent)] hover:bg-[var(--accent-light)] px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Add
            </button>
          </div>

          <div className="space-y-3">
            {recipients.map((r, i) => (
              <div key={i} className="flex gap-2 items-center stagger-in" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={r}
                    onChange={(e) => updateRecipient(i, e.target.value)}
                    placeholder={`Address ${i + 1} (G...)`}
                    className="input-stellar font-mono text-sm pl-4 pr-24 py-3"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--text-secondary)] bg-[var(--bg-elevated)] px-2 py-1 rounded">
                    {share > 0 ? share.toFixed(4) : '0.00'}
                  </div>
                </div>
                <button 
                  onClick={() => removeRecipient(i)}
                  disabled={recipients.length <= 2}
                  className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl border border-[var(--border-soft)] text-[var(--text-hint)] hover:text-[var(--error)] hover:bg-[var(--error-light)] hover:border-[var(--error)]/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Summary & Submit */}
        <div className="mt-auto pt-6 border-t border-[var(--border-soft)] space-y-4">
          <div className="bg-[var(--bg-elevated)]/50 rounded-xl p-4 border border-[var(--border-soft)]">
            <div className="flex justify-between items-center text-sm font-bold text-[var(--text-primary)]">
              <span>Total to send</span>
              <span>{numTotal > 0 ? numTotal.toFixed(4) : '0.0000'} {token}</span>
            </div>
            {token === 'XLM' && numTotal > 0 && (
              <div className="flex justify-between items-center text-xs font-bold text-[var(--success)] mt-2 pt-2 border-t border-[var(--border-soft)]">
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  SDT Reward Earned
                </span>
                <span>+{(numTotal * 0.1).toFixed(2)} SDT</span>
              </div>
            )}
          </div>
          
          {error && (
            <div className="text-[11px] font-bold text-[var(--error)] bg-[var(--error-light)] px-3 py-2 rounded-lg border border-[var(--error)]/20 text-center">
              {error}
            </div>
          )}

          {txHash && !loading && !error && (
            <div className="text-center">
              <a href={`https://stellar.expert/explorer/testnet/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-[var(--accent)] hover:text-[var(--accent-hover)] underline transition-colors">
                View split confirmation on Explorer &rarr;
              </a>
            </div>
          )}

          <button
            id="split-btn"
            onClick={handleSubmit}
            disabled={!isConnected || numTotal <= 0 || recipients.some(r => r.length < 56) || loading}
            className="btn-press btn-primary-glow w-full py-4 rounded-xl font-black text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[var(--accent)]/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="circle-spinner" />
                Processing Split...
              </>
            ) : (
              'Sign & Submit Split'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
