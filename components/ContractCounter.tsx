'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useWallet } from '@/context/WalletContext'
import { getCount, callIncrement, CONTRACT_IDS } from '@/lib/soroban'
import { UserRejectedError } from '@/lib/errors'

type Status = 'IDLE' | 'SIMULATING' | 'SIGNING' | 'SENDING' | 'SUCCESS' | 'FAILED'

export function ContractCounter() {
  const { publicKey, isConnected } = useWallet()
  const [count, setCount] = useState<number | null>(null)
  const [status, setStatus] = useState<Status>('IDLE')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [popKey, setPopKey] = useState(0) // trigger re-animation
  const prevCountRef = useRef<number | null>(null)

  // Load count on mount
  useEffect(() => {
    getCount().then((c) => {
      setCount(c)
      prevCountRef.current = c
    })
  }, [])

  const handleIncrement = async () => {
    if (!publicKey || status !== 'IDLE') return
    setError(null)
    setTxHash(null)

    try {
      setStatus('SIMULATING')
      // Simulate briefly then jump to signing
      await new Promise((r) => setTimeout(r, 600))
      setStatus('SIGNING')

      const result = await callIncrement(publicKey)

      setStatus('SENDING')
      await new Promise((r) => setTimeout(r, 300))

      setCount(result.count)
      setPopKey((k) => k + 1)
      setTxHash(result.txHash)
      setStatus('SUCCESS')
      setTimeout(() => setStatus('IDLE'), 6000)
    } catch (e: any) {
      if (e instanceof UserRejectedError || e?.message?.includes('reject')) {
        setError('You rejected the signing request.')
      } else {
        setError(e?.message || 'Contract call failed.')
      }
      setStatus('FAILED')
      setTimeout(() => setStatus('IDLE'), 5000)
    }
  }

  const formatContractId = (id: string) =>
    `${id.slice(0, 6)}…${id.slice(-6)}`

  const copyContractId = async () => {
    await navigator.clipboard.writeText(CONTRACT_IDS.counter).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const buttonLabel: Record<Status, string> = {
    IDLE: 'Increment Counter',
    SIMULATING: 'Simulating…',
    SIGNING: 'Waiting for approval…',
    SENDING: 'Submitting…',
    SUCCESS: 'Incremented! ✓',
    FAILED: 'Try Again',
  }

  const isLoading = ['SIMULATING', 'SIGNING', 'SENDING'].includes(status)

  return (
    <div
      className={`premium-card p-6 transition-all duration-300 ${
        status === 'SUCCESS' ? 'glow-success ring-2 ring-emerald-500/30' : ''
      } fade-in`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
            <svg className="w-4 h-4 text-[#3730A3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold text-[#1C1917]">On-Chain Counter</div>
            <div className="text-xs text-[#78716C]">Soroban Smart Contract</div>
          </div>
        </div>

        {/* Contract address badge */}
        <button
          onClick={copyContractId}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F5F5F4] hover:bg-[#EEF2FF] text-[#78716C] hover:text-[#3730A3] text-[11px] font-mono font-semibold transition-all group"
          title="Copy contract address"
        >
          {formatContractId(CONTRACT_IDS.counter)}
          {copied ? (
            <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-3 h-3 opacity-60 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          )}
        </button>
      </div>

      {/* Large count display */}
      <div className="text-center py-8 select-none">
        <div
          key={popKey}
          className={`text-7xl font-black stat-number text-[#1C1917] tracking-tight leading-none ${
            popKey > 0 ? 'count-pop' : ''
          } ${status === 'SUCCESS' ? 'gradient-text' : ''}`}
        >
          {count === null ? (
            <span className="inline-block w-24 h-16 skeleton mx-auto" />
          ) : (
            count.toLocaleString()
          )}
        </div>
        <p className="text-sm text-[#78716C] font-medium mt-3">
          total increments on Stellar Testnet
        </p>
      </div>

      {/* Success row */}
      {status === 'SUCCESS' && txHash && (
        <div className="mb-4 p-3 rounded-xl bg-[#DCFCE7] border border-emerald-200 flex items-center justify-between fade-in">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#166534] flex items-center justify-center text-white">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-[#166534] text-xs font-bold">Incremented! New count: {count}</span>
          </div>
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#3730A3] text-xs font-bold hover:underline"
          >
            View →
          </a>
        </div>
      )}

      {/* Error */}
      {status === 'FAILED' && error && (
        <div className="mb-4 p-3 rounded-xl bg-[#FEE2E2] border border-red-200 fade-in">
          <p className="text-[#991B1B] text-xs font-semibold">{error}</p>
        </div>
      )}

      {/* Increment button */}
      <button
        onClick={handleIncrement}
        disabled={isLoading || !isConnected}
        className={`w-full py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#3730A3] focus:ring-offset-2 ${
          status === 'SUCCESS'
            ? 'bg-[#DCFCE7] text-[#166534] border border-emerald-200'
            : isLoading || !isConnected
            ? 'bg-[#EEF2FF] text-[#3730A3]/50 cursor-not-allowed'
            : 'bg-[#3730A3] hover:bg-[#312e81] text-white hover:shadow-lg hover:-translate-y-0.5 glow-accent'
        }`}
      >
        {isLoading && (
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {buttonLabel[status]}
      </button>

      {!isConnected && (
        <p className="text-center text-xs text-[#78716C] mt-2">Connect wallet to increment</p>
      )}

      {/* Footer link */}
      <div className="mt-4 pt-4 border-t border-[#E7E5E4] text-center">
        <a
          href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_IDS.counter}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#78716C] hover:text-[#3730A3] font-medium transition-colors inline-flex items-center gap-1"
        >
          View contract on Stellar Expert
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  )
}
