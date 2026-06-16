import React, { useEffect } from 'react'
import { FREIGHTER_ID } from '@creit-tech/stellar-wallets-kit/modules/freighter'
import { XBULL_ID } from '@creit-tech/stellar-wallets-kit/modules/xbull'
import { ALBEDO_ID } from '@creit-tech/stellar-wallets-kit/modules/albedo'

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (walletId: string) => void
}

const wallets = [
  {
    id: FREIGHTER_ID,
    name: 'Freighter',
    description: 'Browser Extension',
    tag: 'Most Popular',
    tagColor: '#EEF2FF',
    tagText: '#3730A3',
    icon: (
      <svg className="w-7 h-7 text-[#3730A3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: XBULL_ID,
    name: 'xBull',
    description: 'Browser Extension',
    tag: null,
    tagColor: '',
    tagText: '',
    icon: (
      <svg className="w-7 h-7 text-[#3730A3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="8 12 12 8 16 12" />
        <line x1="12" y1="8" x2="12" y2="16" />
      </svg>
    ),
  },
  {
    id: ALBEDO_ID,
    name: 'Albedo',
    description: 'Web Wallet · No extension needed',
    tag: 'No Install',
    tagColor: '#DCFCE7',
    tagText: '#166534',
    icon: (
      <svg className="w-7 h-7 text-[#3730A3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    ),
  },
]

export function WalletModal({ isOpen, onClose, onSelect }: WalletModalProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1C1917]/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-[#E7E5E4] z-10 slide-down overflow-hidden">
        {/* Gradient top strip */}
        <div className="h-1 w-full bg-gradient-to-r from-[#3730A3] via-[#4F46E5] to-[#6D28D9]" />

        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-black text-[#1C1917]">Connect a Wallet</h2>
            <p className="text-xs text-[#78716C] font-medium mt-0.5">
              Choose your preferred Stellar wallet to continue
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-[#F5F5F4] transition-colors -mt-0.5 -mr-1"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Wallet rows */}
        <div className="px-3 pb-5 flex flex-col gap-2">
          {wallets.map((w) => (
            <button
              key={w.id}
              onClick={() => { onSelect(w.id); onClose() }}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-[#E7E5E4] hover:border-[#3730A3] hover:bg-[#EEF2FF] text-left transition-all group focus:outline-none focus:ring-2 focus:ring-[#3730A3]"
            >
              {/* Icon */}
              <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-[#F5F5F4] group-hover:bg-white flex items-center justify-center transition-colors">
                {w.icon}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-[#1C1917]">{w.name}</span>
                  {w.tag && (
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ backgroundColor: w.tagColor, color: w.tagText }}
                    >
                      {w.tag}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#78716C] font-medium mt-0.5 truncate">{w.description}</p>
              </div>

              {/* Arrow */}
              <svg
                className="w-4 h-4 text-[#78716C] group-hover:text-[#3730A3] group-hover:translate-x-0.5 transition-all flex-shrink-0"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* Footer note */}
        <div className="px-6 py-3 border-t border-[#E7E5E4] bg-[#FAFAF9] text-center">
          <p className="text-[10px] text-[#78716C] font-medium">
            By connecting you agree to interact with the Stellar Testnet only.
            <br />No real funds are at risk.
          </p>
        </div>
      </div>
    </div>
  )
}
