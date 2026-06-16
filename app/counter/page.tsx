import React from 'react'
import { ContractCounter } from '@/components/ContractCounter'
import Link from 'next/link'

export default function CounterPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex items-center gap-4">
        <Link 
          href="/" 
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-[var(--border-soft)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-medium)] transition-all shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">Contract Counter</h1>
          <p className="text-sm font-bold text-[var(--text-secondary)]">Interact with the Soroban smart contract</p>
        </div>
      </div>

      <ContractCounter />
    </div>
  )
}
