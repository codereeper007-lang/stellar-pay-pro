'use client'
import React, { useState, useEffect } from 'react'
import { useWallet } from '@/context/WalletContext'
import { isValidStellarAddress } from '@/lib/stellar'
import { sendXLM } from '@/lib/transactions'
import { UserRejectedError } from '@/lib/errors'

type FormState = 'IDLE' | 'SIGNING' | 'SENDING' | 'SUCCESS' | 'REJECTED' | 'FAILED'

export function SendPayment() {
  const { publicKey, balance, refreshBalance } = useWallet()

  const [destination, setDestination] = useState('')
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [formState, setFormState] = useState<FormState>('IDLE')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
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

  const handleCopyHash = async () => {
    if (!txHash) return
    await navigator.clipboard.writeText(txHash).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
      <div className="premium-card p-8 text-center fade-in ring-2 ring-emerald-400/30">
        <div className="h-1.5 -mx-8 -mt-8 mb-8 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-t-2xl" />
        <div className="mx-auto w-16 h-16 rounded-full bg-[#DCFCE7] flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-[#166534]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-black text-[#1C1917] mb-2">Payment Sent! 🎉</h3>
        <p className="text-sm text-[#78716C] font-medium mb-6">
          <span className="font-bold text-[#1C1917]">{amount} XLM</span> sent to{' '}
          <span className="font-mono text-xs bg-[#F5F5F4] px-1.5 py-0.5 rounded">
            {destination.slice(0, 5)}…{destination.slice(-5)}
          </span>
        </p>

        {txHash && (
          <div className="mb-6 flex flex-col items-center gap-2">
            <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-widest">Transaction Hash</span>
            <div className="flex items-center gap-2 bg-[#F5F5F4] border border-[#E7E5E4] px-4 py-2 rounded-xl max-w-xs w-full">
              <span className="font-mono text-xs text-[#1C1917] truncate flex-1">{txHash}</span>
              <button onClick={handleCopyHash} className="text-[#78716C] hover:text-[#3730A3] transition-colors flex-shrink-0" title="Copy">
                {copied
                  ? <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                }
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#3730A3] to-[#4F46E5] hover:from-[#312e81] hover:to-[#4338CA] transition-all"
          >
            View on Stellar Expert
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
          <button onClick={resetForm} className="w-full px-4 py-3 rounded-xl text-sm font-bold text-[#78716C] hover:text-[#1C1917] hover:bg-[#F5F5F4] transition-all">
            Send Another
          </button>
        </div>
      </div>
    )
  }

  // ── REJECTED ─────────────────────────────────────────────────────────────
  if (formState === 'REJECTED') {
    return (
      <div className="premium-card p-8 text-center fade-in">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-black text-[#1C1917] mb-2">Transaction Cancelled</h3>
        <p className="text-sm text-[#78716C] font-medium mb-6">You rejected the signing request in your wallet.</p>
        <button onClick={() => setFormState('IDLE')} className="w-full px-4 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#3730A3] to-[#4F46E5] hover:from-[#312e81] hover:to-[#4338CA] transition-all">
          Try Again
        </button>
      </div>
    )
  }

  // ── FAILED ────────────────────────────────────────────────────────────────
  if (formState === 'FAILED') {
    return (
      <div className="premium-card p-8 text-center fade-in ring-2 ring-red-200">
        <div className="mx-auto w-16 h-16 rounded-full bg-[#FEE2E2] flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-[#991B1B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="text-lg font-black text-[#1C1917] mb-3">Transaction Failed</h3>
        <p className="text-sm font-medium text-[#991B1B] bg-[#FEE2E2] border border-red-200 px-4 py-3 rounded-xl mb-6 break-words max-w-sm mx-auto">
          {errorMessage || 'An unknown network error occurred.'}
        </p>
        <button onClick={() => setFormState('IDLE')} className="w-full px-4 py-3 rounded-xl text-sm font-bold text-white bg-[#991B1B] hover:bg-[#7f1d1d] transition-all">
          Try Again
        </button>
      </div>
    )
  }

  // ── SIGNING / SENDING ─────────────────────────────────────────────────────
  if (formState === 'SIGNING' || formState === 'SENDING') {
    return (
      <div className="premium-card p-6 fade-in">
        <div className="flex items-center gap-2 mb-6">
          <svg className="animate-spin w-5 h-5 text-[#3730A3]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <h3 className="text-base font-bold text-[#1C1917]">Processing Transaction</h3>
        </div>

        <div className="relative flex flex-col gap-0 pl-7">
          {/* Vertical connector */}
          <div className="absolute left-[13px] top-5 bottom-5 w-0.5 bg-gradient-to-b from-[#3730A3] to-[#E7E5E4]" />

          {/* Step 1 */}
          <div className="relative flex items-start gap-4 pb-8">
            <div className={`relative z-10 w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              formState === 'SENDING'
                ? 'border-[#166534] bg-[#166534]'
                : 'border-[#3730A3] bg-white'
            }`}>
              {formState === 'SENDING'
                ? <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                : <div className="w-2 h-2 rounded-full bg-[#3730A3] animate-pulse" />
              }
            </div>
            <div className="pt-1">
              <div className={`text-sm font-bold ${formState === 'SIGNING' ? 'text-[#3730A3]' : 'text-[#78716C]'}`}>
                Step 1: Sign Transaction
              </div>
              <div className="text-xs text-[#78716C] mt-0.5">
                {formState === 'SIGNING' ? 'Approve in your wallet extension…' : 'Signed ✓'}
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative flex items-start gap-4">
            <div className={`relative z-10 w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              formState === 'SENDING'
                ? 'border-[#3730A3] bg-white'
                : 'border-[#E7E5E4] bg-white'
            }`}>
              {formState === 'SENDING'
                ? <span className="w-2.5 h-2.5 rounded-full bg-[#3730A3] animate-ping" />
                : <div className="w-2 h-2 rounded-full bg-[#E7E5E4]" />
              }
            </div>
            <div className="pt-1">
              <div className={`text-sm font-bold ${formState === 'SENDING' ? 'text-[#3730A3]' : 'text-[#78716C]'}`}>
                Step 2: Submit to Network
              </div>
              <div className="text-xs text-[#78716C] mt-0.5">
                {formState === 'SENDING' ? 'Broadcasting to Stellar Testnet…' : 'Waiting…'}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-3 rounded-xl bg-[#EEF2FF] border border-[#3730A3]/10 text-xs font-medium text-[#3730A3] text-center">
          Do not close this window
        </div>
      </div>
    )
  }

  // ── IDLE FORM ─────────────────────────────────────────────────────────────
  return (
    <div className="premium-card overflow-hidden fade-in">
      <div className="h-1.5 w-full bg-gradient-to-r from-[#3730A3] via-[#4F46E5] to-[#6D28D9]" />
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
            <svg className="w-4 h-4 text-[#3730A3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1C1917]">Send Payment</h3>
            <p className="text-xs text-[#78716C] font-medium">Transfer XLM to any Stellar address</p>
          </div>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          {/* Destination */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#78716C] uppercase tracking-wide">Destination Address</label>
            <div className="relative">
              <input
                type="text"
                value={destination}
                onChange={(e) => { setDestination(e.target.value); setAddressTouched(true) }}
                onBlur={() => setAddressTouched(true)}
                placeholder="G... Stellar address"
                className={`input-field font-mono pr-10 ${
                  addressTouched && isAddressValid === false ? 'error'
                  : addressTouched && isAddressValid === true ? 'success'
                  : ''
                }`}
              />
              {addressTouched && isAddressValid === true && (
                <div className="absolute inset-y-0 right-3 flex items-center text-emerald-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
              )}
              {addressTouched && isAddressValid === false && (
                <div className="absolute inset-y-0 right-3 flex items-center text-[#991B1B]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </div>
              )}
            </div>
            {addressTouched && isAddressValid === false && (
              <span className="text-xs font-semibold text-[#991B1B]">Enter a valid 56-character Stellar G-address.</span>
            )}
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#78716C] uppercase tracking-wide">Amount (XLM)</label>
              <span className="text-xs text-[#78716C]">
                Available: <span className="font-bold text-[#1C1917]">{balance} XLM</span>
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                min="0.0000001"
                step="0.0000001"
                className={`input-field pr-16 ${amountExceedsBalance ? 'error' : ''}`}
              />
              <button
                type="button"
                onClick={handleMaxAmount}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-[#EEF2FF] hover:bg-[#3730A3] hover:text-white text-[#3730A3] text-xs font-bold transition-all"
              >
                Max
              </button>
            </div>
            {amountExceedsBalance && (
              <span className="text-xs font-semibold text-[#991B1B]">Amount exceeds your available balance.</span>
            )}
          </div>

          {/* Memo */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#78716C] uppercase tracking-wide">Memo <span className="normal-case font-medium">(optional)</span></label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Text memo (max 28 chars)"
              maxLength={28}
              className="input-field"
            />
            <div className="flex justify-between items-center text-[10px] text-[#78716C] font-semibold">
              <span>SEP-29 compliant</span>
              <span className={memo.length >= 25 ? (memo.length >= 28 ? 'text-[#991B1B]' : 'text-amber-600') : ''}>
                {memo.length}/28
              </span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#3730A3] focus:ring-offset-2 ${
              isFormValid
                ? 'bg-gradient-to-r from-[#3730A3] to-[#4F46E5] hover:from-[#312e81] hover:to-[#4338CA] text-white shadow-md hover:shadow-indigo-200 hover:-translate-y-0.5'
                : 'bg-[#F5F5F4] text-[#78716C] cursor-not-allowed'
            }`}
          >
            {isFormValid ? '⚡ Send XLM' : 'Fill in all fields to send'}
          </button>
        </form>
      </div>
    </div>
  )
}
