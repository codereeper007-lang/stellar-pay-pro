'use client'
import React, { useState, useEffect } from 'react'
import { useWallet } from '@/context/WalletContext'
import { isValidStellarAddress } from '@/lib/stellar'
import { sendXLM } from '@/lib/transactions'
import { UserRejectedError } from '@/lib/errors'
import { copyToClipboard } from '@/lib/clipboard'

type FormState = 'IDLE' | 'SIGNING' | 'SENDING' | 'SUCCESS' | 'REJECTED' | 'FAILED'

export function SendPayment() {
  const { publicKey, balance, refreshBalance } = useWallet()

  const [destination, setDestination] = useState('')
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [formState, setFormState] = useState<FormState>('IDLE')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isAddressValid, setIsAddressValid] = useState<boolean | null>(null)
  const [addressTouched, setAddressTouched] = useState(false)

  useEffect(() => {
    if (!destination) { setIsAddressValid(null); return }
    const t = setTimeout(() => setIsAddressValid(isValidStellarAddress(destination)), 300)
    return () => clearTimeout(t)
  }, [destination])

  const numAmount = parseFloat(amount || '0')
  const numBalance = parseFloat(balance || '0')
  const isAmountValid = numAmount > 0 && numAmount <= numBalance
  const amountExceedsBalance = numAmount > numBalance
  const isFormValid = isAddressValid === true && isAmountValid && memo.length <= 28

  const handleMaxAmount = () => {
    const max = Math.max(0, numBalance - 1.0)
    setAmount(max > 0 ? max.toFixed(7).replace(/\.?0+$/, '') : '0')
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid || !publicKey) return
    setFormState('SIGNING')
    setErrorMessage(null)
    setTxHash(null)
    try {
      const result = await sendXLM({
        sourcePublicKey: publicKey,
        destination,
        amount,
        memo: memo || undefined,
        onStatus: (s) => {
          if (s === 'signing') setFormState('SIGNING')
          if (s === 'sending') setFormState('SENDING')
        },
      })
      if (result.success && result.hash) {
        setTxHash(result.hash)
        setFormState('SUCCESS')
        refreshBalance()
      } else {
        setErrorMessage(result.error)
        setFormState('FAILED')
      }
    } catch (err: any) {
      if (err instanceof UserRejectedError) setFormState('REJECTED')
      else { setErrorMessage(err?.message || 'Transaction failed.'); setFormState('FAILED') }
    }
  }

  const resetForm = () => {
    setDestination(''); setAmount(''); setMemo('')
    setAddressTouched(false); setFormState('IDLE'); setTxHash(null); setErrorMessage(null)
  }

  // ── SUCCESS ──────────────────────────────────────────────────────────────
  if (formState === 'SUCCESS') {
    return (
      <div className="premium-card p-8 text-center fade-in bg-[var(--success-light)] transition-colors duration-500">
        <div className="mx-auto w-20 h-20 rounded-full bg-[var(--success)] flex items-center justify-center mb-6 shadow-lg relative">
          <svg className="w-10 h-10 text-white draw-check" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="stagger-in text-2xl font-black text-[var(--text-primary)] mb-2">Payment Sent!</h3>
        <p className="stagger-in text-sm text-[var(--text-secondary)] font-medium mb-8" style={{animationDelay: '100ms'}}>
          <span className="font-bold text-[var(--text-primary)]">{amount} XLM</span> sent to{' '}
          <span className="font-mono text-xs bg-white px-1.5 py-0.5 rounded shadow-sm border border-[var(--border-soft)]">
            {destination.slice(0, 5)}…{destination.slice(-5)}
          </span>
        </p>

        {txHash && (
          <div className="stagger-in mb-6 flex flex-col items-center gap-2" style={{animationDelay: '200ms'}}>
            <span className="text-[10px] font-bold text-[var(--text-hint)] uppercase tracking-widest">Transaction Hash</span>
            <div className="flex items-center gap-2 bg-white border border-[var(--border-soft)] px-4 py-2 rounded-xl max-w-xs w-full shadow-sm">
              <span className="font-mono text-xs text-[var(--text-primary)] truncate flex-1">{txHash}</span>
              <button onClick={() => copyToClipboard(txHash)} className="text-[var(--text-hint)] hover:text-[var(--accent)] transition-colors flex-shrink-0" title="Copy">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </button>
            </div>
          </div>
        )}

        <div className="stagger-in flex flex-col gap-3" style={{animationDelay: '300ms'}}>
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
            target="_blank" rel="noopener noreferrer"
            className="btn-press btn-primary-glow inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-bold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-all"
          >
            View on Stellar Expert
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
          <button onClick={resetForm} className="w-full px-4 py-3 rounded-xl text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white border border-transparent hover:border-[var(--border-soft)] transition-all">
            Send Another
          </button>
        </div>
      </div>
    )
  }

  // ── REJECTED ─────────────────────────────────────────────────────────────
  if (formState === 'REJECTED') {
    return (
      <div className="premium-card p-8 text-center fade-in bg-[var(--warning-light)]">
        <div className="mx-auto w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-5 border border-[var(--warning)]/20">
          <svg className="w-8 h-8 text-[var(--warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-black text-[var(--text-primary)] mb-2">Transaction Cancelled</h3>
        <p className="text-sm text-[var(--text-secondary)] font-medium mb-6">You rejected the signing request in your wallet.</p>
        <button onClick={() => setFormState('IDLE')} className="btn-press btn-primary-glow w-full px-4 py-3 rounded-xl text-sm font-bold text-white bg-[var(--accent)] transition-all">
          Try Again
        </button>
      </div>
    )
  }

  // ── FAILED ────────────────────────────────────────────────────────────────
  if (formState === 'FAILED') {
    return (
      <div className="premium-card p-8 text-center fade-in ring-2 ring-[var(--error)]/20 bg-[var(--error-light)]">
        <div className="mx-auto w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-5 border border-[var(--error)]/20">
          <svg className="w-8 h-8 text-[var(--error)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="text-xl font-black text-[var(--text-primary)] mb-3">Transaction Failed</h3>
        <p className="text-sm font-bold text-[var(--error)] bg-white border border-[var(--error)]/20 shadow-sm px-4 py-3 rounded-xl mb-6 break-words max-w-sm mx-auto">
          {errorMessage || 'An unknown network error occurred.'}
        </p>
        <button onClick={() => setFormState('IDLE')} className="btn-press w-full px-4 py-3 rounded-xl text-sm font-bold text-white bg-[var(--error)] hover:bg-red-800 transition-all shadow-md shadow-red-900/20">
          Try Again
        </button>
      </div>
    )
  }

  // ── SIGNING / SENDING ─────────────────────────────────────────────────────
  if (formState === 'SIGNING' || formState === 'SENDING') {
    return (
      <div className="premium-card p-8 fade-in relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--accent-light)]">
          <div className="h-full bg-[var(--accent)] transition-all duration-1000 w-full animate-pulse" />
        </div>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="circle-spinner text-[var(--accent)]" />
          <h3 className="text-lg font-black text-[var(--text-primary)]">Processing Transaction</h3>
        </div>

        <div className="relative flex flex-col gap-0 pl-8">
          <div className="absolute left-[15px] top-6 bottom-8 w-[2px] bg-gradient-to-b from-[var(--accent)] to-[var(--border-soft)]" />

          {/* Step 1 */}
          <div className="relative flex items-start gap-5 pb-10">
            <div className={`relative z-10 w-8 h-8 rounded-full border-[3px] flex items-center justify-center flex-shrink-0 transition-all bg-white ${
              formState === 'SENDING' ? 'border-[var(--success)]' : 'border-[var(--accent)]'
            }`}>
              {formState === 'SENDING'
                ? <svg className="w-4 h-4 text-[var(--success)] draw-check" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                : <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
              }
            </div>
            <div className="pt-1.5">
              <div className={`text-base font-bold ${formState === 'SIGNING' ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}>
                Step 1: Sign Transaction
              </div>
              <div className="text-xs text-[var(--text-hint)] font-semibold mt-1">
                {formState === 'SIGNING' ? 'Approve in your wallet extension…' : 'Signed ✓'}
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative flex items-start gap-5">
            <div className={`relative z-10 w-8 h-8 rounded-full border-[3px] flex items-center justify-center flex-shrink-0 transition-all bg-white ${
              formState === 'SENDING' ? 'border-[var(--accent)]' : 'border-[var(--border-soft)]'
            }`}>
              {formState === 'SENDING'
                ? <span className="w-3 h-3 rounded-full bg-[var(--accent)] animate-ping" />
                : <div className="w-2.5 h-2.5 rounded-full bg-[var(--border-soft)]" />
              }
            </div>
            <div className="pt-1.5">
              <div className={`text-base font-bold ${formState === 'SENDING' ? 'text-[var(--accent)]' : 'text-[var(--text-hint)]'}`}>
                Step 2: Submit to Network
              </div>
              <div className="text-xs text-[var(--text-hint)] font-semibold mt-1">
                {formState === 'SENDING' ? 'Broadcasting to Stellar Testnet…' : 'Waiting…'}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── IDLE FORM ─────────────────────────────────────────────────────────────
  return (
    <div className="premium-card card-ambient overflow-hidden fade-in">
      <div className="h-1.5 w-full bg-[var(--accent)]" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-[var(--text-primary)]">Send Payment</h3>
            <p className="text-xs text-[var(--text-secondary)] font-bold mt-1">Transfer XLM to any address</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[var(--accent-light)] flex items-center justify-center shadow-inner">
            <svg className="w-5 h-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
        </div>

        <form onSubmit={handleSend} className="space-y-5">
          {/* Destination */}
          <div className="relative group">
            <input
              id="destination"
              type="text"
              value={destination}
              onChange={(e) => { setDestination(e.target.value); setAddressTouched(true) }}
              onBlur={() => setAddressTouched(true)}
              placeholder=" "
              className={`input-stellar peer font-mono pt-6 pb-2 pl-4 pr-10 ${
                addressTouched && isAddressValid === false ? 'error shake'
                : addressTouched && isAddressValid === true ? 'success'
                : ''
              }`}
            />
            <label htmlFor="destination" className="absolute text-xs font-bold text-[var(--text-hint)] uppercase tracking-wider top-4 left-4 transition-all peer-focus:-translate-y-2 peer-focus:text-[9px] peer-focus:text-[var(--accent)] peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-[9px] pointer-events-none">
              Destination Address
            </label>
            {addressTouched && isAddressValid === true && (
              <div className="absolute inset-y-0 right-3 flex items-center text-[var(--success)]">
                <svg className="w-5 h-5 draw-check" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
            )}
            {addressTouched && isAddressValid === false && (
              <div className="absolute inset-y-0 right-3 flex items-center text-[var(--error)]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </div>
            )}
            {addressTouched && isAddressValid === false && (
              <div className="absolute -bottom-5 left-1 text-[10px] font-bold text-[var(--error)]">Invalid 56-character G-address</div>
            )}
          </div>

          {/* Amount */}
          <div className="relative mt-2">
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder=" "
              min="0.0000001"
              step="0.0000001"
              className={`input-stellar peer text-lg font-bold pt-6 pb-2 pl-4 pr-16 ${amountExceedsBalance ? 'error shake' : ''}`}
            />
            <label htmlFor="amount" className="absolute text-xs font-bold text-[var(--text-hint)] uppercase tracking-wider top-4 left-4 transition-all peer-focus:-translate-y-2 peer-focus:text-[9px] peer-focus:text-[var(--accent)] peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-[9px] pointer-events-none">
              Amount (XLM)
            </label>
            <button
              type="button"
              onClick={handleMaxAmount}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--accent)] hover:text-white text-[var(--text-secondary)] text-[10px] font-black tracking-widest uppercase transition-all shadow-sm"
            >
              Max
            </button>
            <div className="flex justify-between items-center mt-1.5 px-1">
              <span className="text-[10px] font-bold text-[var(--text-secondary)]">
                Available: <span className="text-[var(--text-primary)]">{balance} XLM</span>
              </span>
              {amountExceedsBalance && (
                <span className="text-[10px] font-bold text-[var(--error)]">Exceeds balance</span>
              )}
            </div>
          </div>

          {/* Memo */}
          <div className="relative">
            <input
              id="memo"
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder=" "
              maxLength={28}
              className="input-stellar peer pt-6 pb-2 pl-4 pr-4"
            />
            <label htmlFor="memo" className="absolute text-xs font-bold text-[var(--text-hint)] uppercase tracking-wider top-4 left-4 transition-all peer-focus:-translate-y-2 peer-focus:text-[9px] peer-focus:text-[var(--accent)] peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-[9px] pointer-events-none">
              Memo <span className="normal-case font-semibold tracking-normal text-[var(--text-hint)]/70">(optional)</span>
            </label>
            <div className="flex justify-end items-center text-[10px] text-[var(--text-hint)] font-bold mt-1 px-1">
              <span className={memo.length >= 25 ? (memo.length >= 28 ? 'text-[var(--error)]' : 'text-[var(--warning)]') : ''}>
                {memo.length}/28
              </span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-4 px-4 rounded-xl text-sm font-black transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 ${
              isFormValid
                ? 'btn-press btn-primary-glow bg-[var(--accent)] text-white'
                : 'bg-[var(--bg-elevated)] text-[var(--text-hint)] cursor-not-allowed'
            }`}
          >
            {isFormValid ? '⚡ Send XLM' : 'Fill in all fields'}
          </button>
        </form>
      </div>
    </div>
  )
}
