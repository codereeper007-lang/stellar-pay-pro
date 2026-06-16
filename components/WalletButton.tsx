'use client'
import React, { useState } from 'react'
import { useWallet } from '@/context/WalletContext'

export function WalletButton({ onConnectClick }: { onConnectClick?: () => void }) {
  const { publicKey, isConnected, isLoading, disconnect } = useWallet()
  const [showDropdown, setShowDropdown] = useState(false)

  if (isLoading) {
    return (
      <button disabled className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] font-bold text-sm cursor-wait">
        <div className="circle-spinner" />
        Connecting...
      </button>
    )
  }

  if (!isConnected || !publicKey) {
    return (
      <button 
        onClick={onConnectClick}
        className="btn-press btn-primary-glow flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
        Connect Wallet
      </button>
    )
  }

  const truncated = `${publicKey.slice(0, 4)}…${publicKey.slice(-4)}`

  return (
    <div className="relative">
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-[var(--border-soft)] hover:bg-[var(--bg-elevated)] hover:border-[var(--border-medium)] transition-all font-mono font-bold text-sm text-[var(--text-primary)] shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--border-soft)] hover:scale-[1.02]"
      >
        <span className="w-2 h-2 rounded-full bg-[var(--success)] live-dot" />
        {truncated}
        <svg className="w-3.5 h-3.5 text-[var(--text-hint)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-[var(--border-soft)] overflow-hidden slide-in-top z-50">
          <div className="p-4 bg-[var(--bg-elevated)]/30 border-b border-[var(--border-soft)]">
            <div className="text-[10px] font-bold text-[var(--text-hint)] uppercase tracking-widest mb-1.5">Connected Address</div>
            <div className="font-mono text-xs font-bold text-[var(--text-primary)] break-all">{publicKey}</div>
          </div>
          
          <div className="p-2 space-y-1">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(publicKey)
                setShowDropdown(false)
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] rounded-xl transition-colors text-left"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              Copy Address
            </button>
            <a 
              href={`https://stellar.expert/explorer/testnet/account/${publicKey}`}
              target="_blank" rel="noopener noreferrer"
              onClick={() => setShowDropdown(false)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-xl transition-colors text-left"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              View Explorer
            </a>
          </div>

          <div className="p-2 border-t border-[var(--border-soft)] bg-[var(--bg-elevated)]/30">
            <button 
              onClick={() => {
                disconnect()
                setShowDropdown(false)
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-[var(--error)] hover:bg-[var(--error-light)] rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Disconnect Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
