'use client'
import React, { useState, useEffect } from 'react'
import { useWallet } from '@/context/WalletContext'

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { publicKey, balance, isConnected, disconnect } = useWallet()

  // Prevent background scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const fmt = (addr: string) => `${addr.slice(0, 5)}…${addr.slice(-5)}`

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 -mr-2 text-[#1C1917] hover:bg-[#F5F5F4] rounded-lg transition-colors focus:outline-none"
        aria-label="Open menu"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-[#1C1917]/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 bottom-0 w-[85vw] max-w-sm bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E7E5E4]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3730A3] to-[#4F46E5] flex items-center justify-center text-white font-black text-xs shadow-sm">
              SP
            </div>
            <span className="font-black text-[#1C1917] tracking-tight">StellarPay Pro</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 -mr-2 text-[#78716C] hover:text-[#1C1917] hover:bg-[#F5F5F4] rounded-lg transition-colors focus:outline-none"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 px-5 flex flex-col gap-6">
          
          {/* Wallet Status Card */}
          {isConnected && publicKey ? (
            <div className="bg-[#FAFAF9] border border-[#E7E5E4] rounded-xl p-4">
              <div className="text-[10px] font-bold text-[#78716C] uppercase tracking-widest mb-3">Connected Wallet</div>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                    {publicKey.slice(0, 2)}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                </div>
                <div>
                  <div className="font-mono text-xs font-bold text-[#1C1917]">{fmt(publicKey)}</div>
                  <div className="text-xs text-[#78716C] font-semibold mt-0.5">{balance} XLM</div>
                </div>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(publicKey)
                }}
                className="w-full py-2 bg-white border border-[#E7E5E4] rounded-lg text-xs font-bold text-[#1C1917] hover:bg-[#F5F5F4] transition-colors"
              >
                Copy Full Address
              </button>
            </div>
          ) : (
            <div className="bg-[#EEF2FF] border border-[#3730A3]/20 rounded-xl p-4 text-center">
              <p className="text-sm font-bold text-[#3730A3] mb-1">Not Connected</p>
              <p className="text-xs text-[#3730A3]/70 font-medium mb-3">Connect your wallet to access all features.</p>
              <button
                onClick={() => {
                  setIsOpen(false)
                  // Let the desktop connect logic trigger (or trigger Modal here if passed as prop)
                  document.getElementById('connect-wallet-btn')?.click()
                  document.getElementById('hero-connect-btn')?.click()
                }}
                className="w-full py-2 bg-[#3730A3] text-white rounded-lg text-xs font-bold shadow-sm"
              >
                Connect Wallet
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <div>
            <div className="text-[10px] font-bold text-[#78716C] uppercase tracking-widest mb-2">Menu</div>
            <nav className="flex flex-col gap-1">
              {[
                { name: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                { name: 'Send XLM', icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
                { name: 'Split Payment', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
                { name: 'Smart Contract', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
                { name: 'Live Activity', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
              ].map(item => (
                <a
                  key={item.name}
                  href="#"
                  onClick={(e) => { e.preventDefault(); setIsOpen(false) }}
                  className="flex items-center gap-3 px-3 py-3 text-sm font-bold text-[#1C1917] hover:bg-[#FAFAF9] hover:text-[#3730A3] rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5 text-[#78716C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  {item.name}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Footer */}
        {isConnected && (
          <div className="p-5 border-t border-[#E7E5E4] bg-[#FAFAF9]">
            <button
              onClick={() => {
                disconnect()
                setIsOpen(false)
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FEE2E2] text-[#991B1B] text-sm font-bold hover:bg-[#FECACA] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Disconnect
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
