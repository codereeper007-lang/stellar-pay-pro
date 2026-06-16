'use client'
import React from 'react'

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (walletId: string) => void
}

const WALLETS = [
  { id: 'freighter', name: 'Freighter', desc: 'Browser Extension', icon: '🦊', color: 'bg-[#FFEDD5] text-[#C2410C]' },
  { id: 'xbull', name: 'xBull', desc: 'Browser Extension', icon: '🐂', color: 'bg-[#FEF08A] text-[#A16207]' },
  { id: 'albedo', name: 'Albedo', desc: 'Web Wallet', icon: '🌐', color: 'bg-[#E0E7FF] text-[#4338CA]' },
]

export function WalletModal({ isOpen, onClose, onSelect }: WalletModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-md transition-opacity fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative bg-[var(--bg-surface)] rounded-3xl w-full max-w-sm overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.12)] border border-[var(--border-soft)]"
        style={{ animation: 'staggerIn 250ms cubic-bezier(0.4, 0, 0.2, 1) forwards' }}
      >
        <div className="p-6 border-b border-[var(--border-soft)] flex items-center justify-between bg-[var(--bg-elevated)]/50">
          <div>
            <h2 className="text-xl font-black text-[var(--text-primary)]">Connect a Wallet</h2>
            <p className="text-xs font-bold text-[var(--text-secondary)] mt-1">Choose your preferred Stellar wallet</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-[var(--border-soft)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors shadow-sm focus:outline-none"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-4 space-y-2">
          {WALLETS.map(w => (
            <div 
              key={w.id}
              onClick={() => { onSelect(w.id); onClose() }}
              className="flex items-center gap-4 p-4 rounded-2xl border border-[var(--border-soft)] hover:bg-[var(--accent-light)] hover:border-l-4 hover:border-l-[var(--accent)] hover:border-y-[var(--border-soft)] hover:border-r-[var(--border-soft)] cursor-pointer transition-all bg-white group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${w.color} shadow-inner`}>
                {w.icon}
              </div>
              <div className="flex-1">
                <div className="font-bold text-[var(--text-primary)] text-sm group-hover:text-[var(--accent)] transition-colors">{w.name}</div>
                <div className="text-[11px] font-semibold text-[var(--text-hint)] uppercase tracking-wider">{w.desc}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-secondary)] group-hover:bg-white group-hover:text-[var(--accent)] transition-colors shadow-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 text-center bg-[var(--bg-elevated)]/30 border-t border-[var(--border-soft)]">
          <p className="text-[10px] font-bold text-[var(--text-hint)] uppercase tracking-widest leading-relaxed">
            By connecting a wallet, you agree to our<br/>
            <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--accent)] underline transition-colors">Terms of Service</a> and <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--accent)] underline transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}
