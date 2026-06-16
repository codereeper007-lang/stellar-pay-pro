'use client'
import React, { useState } from 'react'
import { useWallet } from '@/context/WalletContext'
import { WalletModal } from './WalletModal'

export function WalletButton() {
  const { publicKey, isConnected, isLoading, connect, disconnect } = useWallet()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!publicKey) return
    await navigator.clipboard.writeText(publicKey).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const fmt = (addr: string) => `${addr.slice(0, 5)}…${addr.slice(-5)}`

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E7E5E4] bg-white text-sm font-semibold text-[#78716C] select-none">
        <svg className="animate-spin w-3.5 h-3.5 text-[#3730A3]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Connecting…
      </div>
    )
  }

  if (isConnected && publicKey) {
    return (
      <div className="relative">
        {/* Connected pill */}
        <button
          id="wallet-connected-btn"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2.5 pl-3 pr-3.5 py-2 rounded-full border border-[#E7E5E4] bg-white shadow-sm hover:shadow-md hover:border-[#D6D3D1] text-sm font-semibold text-[#1C1917] transition-all select-none focus:outline-none focus:ring-2 focus:ring-[#3730A3]"
        >
          {/* Green pulse */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="font-mono text-[13px]">{fmt(publicKey)}</span>
          <svg
            className={`w-3.5 h-3.5 text-[#78716C] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Click-out backdrop */}
        {isDropdownOpen && (
          <div className="fixed inset-0 z-30" onClick={() => setIsDropdownOpen(false)} />
        )}

        {/* Dropdown */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-72 bg-white border border-[#E7E5E4] rounded-xl shadow-xl z-40 overflow-hidden slide-down">
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-[#EEF2FF] to-[#F5F3FF] border-b border-[#E7E5E4]">
              <div className="text-[10px] font-bold text-[#3730A3] uppercase tracking-widest mb-1">Connected Wallet</div>
              <div className="font-mono text-xs text-[#1C1917] font-semibold break-all select-all leading-relaxed">
                {publicKey}
              </div>
            </div>

            {/* Actions */}
            <div className="p-2 flex flex-col gap-1">
              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-[#1C1917] hover:bg-[#F5F5F4] transition-colors text-left"
              >
                {copied ? (
                  <>
                    <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] flex items-center justify-center text-[#166534]">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[#166534]">Copied!</span>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-lg bg-[#F5F5F4] flex items-center justify-center text-[#78716C]">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    Copy Address
                  </>
                )}
              </button>

              <a
                href={`https://stellar.expert/explorer/testnet/account/${publicKey}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-[#1C1917] hover:bg-[#F5F5F4] transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-[#F5F5F4] flex items-center justify-center text-[#78716C]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
                View on Explorer
              </a>

              <div className="h-px bg-[#E7E5E4] mx-2 my-0.5" />

              <button
                onClick={() => { disconnect(); setIsDropdownOpen(false) }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-[#991B1B] hover:bg-[#FEE2E2] transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-[#FEE2E2] flex items-center justify-center text-[#991B1B]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <button
        id="connect-wallet-btn"
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-[#3730A3] to-[#4F46E5] hover:from-[#312e81] hover:to-[#4338CA] shadow-md hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-[#3730A3] focus:ring-offset-2 select-none"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        Connect Wallet
      </button>

      <WalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(id) => connect(id)}
      />
    </>
  )
}
