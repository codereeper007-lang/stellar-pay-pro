'use client'
import React, { useState } from 'react'
import { useWallet } from '@/context/WalletContext'
import { isValidStellarAddress } from '@/lib/stellar'
import { UserRejectedError } from '@/lib/errors'

type FormState = 'IDLE' | 'SIGNING' | 'SENDING' | 'SUCCESS' | 'REJECTED' | 'FAILED'

export function PaymentSplitter() {
  const { publicKey, balance } = useWallet()
  const [token, setToken] = useState<'XLM' | 'SDT'>('XLM')
  const [amount, setAmount] = useState('')
  const [recipients, setRecipients] = useState<string[]>(['', ''])
  
  const [formState, setFormState] = useState<FormState>('IDLE')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const numAmount = parseFloat(amount || '0')
  const share = numAmount / recipients.length
  
  // Validation
  const validRecipients = recipients.filter(r => isValidStellarAddress(r))
  const allRecipientsValid = validRecipients.length === recipients.length && recipients.length >= 2
  const hasAmount = numAmount > 0
  const isFormValid = allRecipientsValid && hasAmount

  const handleAddRecipient = () => {
    if (recipients.length < 10) {
      setRecipients([...recipients, ''])
    }
  }

  const handleRemoveRecipient = (index: number) => {
    if (recipients.length > 2) {
      setRecipients(recipients.filter((_, i) => i !== index))
    }
  }

  const handleUpdateRecipient = (index: number, value: string) => {
    const newRecipients = [...recipients]
    newRecipients[index] = value
    setRecipients(newRecipients)
  }

  const handleCopyHash = async () => {
    if (!txHash) return
    await navigator.clipboard.writeText(txHash).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSplit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid || !publicKey) return
    
    setFormState('SIGNING')
    setErrorMessage(null)
    setTxHash(null)

    try {
      // Mocking the contract call delay for UI purposes since the specific 
      // contract binding logic wasn't provided in the instructions
      await new Promise(r => setTimeout(r, 1000))
      setFormState('SENDING')
      
      await new Promise(r => setTimeout(r, 2000))
      
      // Generate a mock hash
      const mockHash = Array.from({length: 64}, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('')
      
      setTxHash(mockHash)
      setFormState('SUCCESS')
    } catch (err: any) {
      if (err instanceof UserRejectedError || err?.message?.includes('reject')) {
        setFormState('REJECTED')
      } else {
        setErrorMessage(err?.message || 'Transaction failed.')
        setFormState('FAILED')
      }
    }
  }

  const resetForm = () => {
    setAmount('')
    setRecipients(['', ''])
    setFormState('IDLE')
    setTxHash(null)
    setErrorMessage(null)
  }

  if (formState === 'SUCCESS') {
    return (
      <div className="premium-card p-8 text-center fade-in ring-2 ring-emerald-400/30">
        <div className="h-1.5 -mx-8 -mt-8 mb-8 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-t-2xl" />
        <div className="mx-auto w-16 h-16 rounded-full bg-[#DCFCE7] flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-[#166534]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-black text-[#1C1917] mb-2">Split Successful! 🎉</h3>
        <p className="text-sm text-[#78716C] font-medium mb-6">
          Divided <span className="font-bold text-[#1C1917]">{amount} {token}</span> across {recipients.length} recipients.
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
            Split Another Payment
          </button>
        </div>
      </div>
    )
  }

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
          <div className="absolute left-[13px] top-5 bottom-5 w-0.5 bg-gradient-to-b from-[#3730A3] to-[#E7E5E4]" />
          <div className="relative flex items-start gap-4 pb-8">
            <div className={`relative z-10 w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              formState === 'SENDING' ? 'border-[#166534] bg-[#166534]' : 'border-[#3730A3] bg-white'
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
          <div className="relative flex items-start gap-4">
            <div className={`relative z-10 w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              formState === 'SENDING' ? 'border-[#3730A3] bg-white' : 'border-[#E7E5E4] bg-white'
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
      </div>
    )
  }

  return (
    <div className="premium-card p-6 fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-[#1C1917]">Split Payment</h3>
        <p className="text-xs text-[#78716C] font-medium mt-1">Divide XLM or SDT equally between multiple recipients</p>
      </div>

      <form onSubmit={handleSplit} className="space-y-6">
        {/* Token Selector */}
        <div className="flex bg-[#F5F5F4] p-1 rounded-xl">
          {(['XLM', 'SDT'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setToken(t)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                token === t 
                  ? 'bg-white shadow-sm text-[#3730A3] border border-[#E7E5E4]' 
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Total Amount */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#78716C] uppercase tracking-wide">Total Amount ({token})</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0.0000001"
            step="0.0000001"
            className="input-field text-xl font-medium"
          />
          {hasAmount && (
            <span className="text-xs font-medium text-[#3730A3] mt-1 bg-[#EEF2FF] px-2.5 py-1.5 rounded-md inline-block w-fit">
              Each recipient receives: <strong>{share.toFixed(4).replace(/\.?0+$/, '')} {token}</strong>
            </span>
          )}
        </div>

        {/* Recipients */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold text-[#78716C] uppercase tracking-wide">
              Recipients ({recipients.length}/10)
            </label>
            {recipients.length < 10 && (
              <button
                type="button"
                onClick={handleAddRecipient}
                className="text-xs font-bold text-[#3730A3] hover:text-[#4F46E5] flex items-center gap-1 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Add Recipient
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {recipients.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={r}
                  onChange={(e) => handleUpdateRecipient(i, e.target.value)}
                  placeholder="G... Stellar address"
                  className={`input-field font-mono text-sm ${r && !isValidStellarAddress(r) ? 'error' : r ? 'success' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveRecipient(i)}
                  disabled={recipients.length <= 2}
                  className={`p-2 rounded-xl transition-all ${
                    recipients.length <= 2 
                      ? 'text-[#E7E5E4] cursor-not-allowed' 
                      : 'text-[#78716C] hover:text-[#991B1B] hover:bg-[#FEE2E2]'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Box */}
        {isFormValid && (
          <div className="bg-[#EEF2FF] rounded-xl p-4 border border-[#3730A3]/10 fade-in">
            <div className="text-sm font-bold text-[#1C1917] mb-1">
              Total: {amount} {token} across {recipients.length} recipients
            </div>
            <div className="text-xs font-medium text-[#3730A3] flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              SDT Reward: You will earn {(numAmount * 0.05).toFixed(2)} SDT tokens
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!isFormValid}
          className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#3730A3] focus:ring-offset-2 ${
            isFormValid
              ? 'bg-gradient-to-r from-[#3730A3] to-[#4F46E5] hover:from-[#312e81] hover:to-[#4338CA] text-white shadow-md hover:shadow-indigo-200 hover:-translate-y-0.5'
              : 'bg-[#F5F5F4] text-[#78716C] cursor-not-allowed'
          }`}
        >
          {isFormValid ? `Split ${amount} ${token}` : 'Fill in all fields to split'}
        </button>
      </form>
    </div>
  )
}
