'use client'
import React, { useState } from 'react'
import { useWallet } from '@/context/WalletContext'
import { WalletButton } from '@/components/WalletButton'
import { WalletModal } from '@/components/WalletModal'
import { BalanceCard } from '@/components/BalanceCard'
import { FaucetButton } from '@/components/FaucetButton'
import { SendPayment } from '@/components/SendPayment'
import { ContractCounter } from '@/components/ContractCounter'
import { ActivityFeed } from '@/components/ActivityFeed'
import { PaymentSplitter } from '@/components/PaymentSplitter'
import { MobileMenu } from '@/components/MobileMenu'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { TransactionHistory } from '@/components/TransactionHistory'
import { NetworkBanner } from '@/components/NetworkBanner'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ToastProvider } from '@/components/ui/Toast'
import { useKeyboard } from '@/hooks/useKeyboard'

function SectionHeading({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="flex-1 h-px bg-[var(--border-soft)]" />
      <div className="text-center">
        <div className="section-label mb-0.5">{label}</div>
        <div className="text-base font-bold text-[var(--text-primary)]">{children}</div>
      </div>
      <div className="flex-1 h-px bg-[var(--border-soft)]" />
    </div>
  )
}

export default function Home() {
  const { isConnected, connect, disconnect } = useWallet()
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false) // Triggered via links if needed

  // Global hotkeys
  useKeyboard(
    () => { if (!isConnected) setIsHeroModalOpen(true) },
    () => setIsHeroModalOpen(false)
  )

  return (
    <div className="min-h-screen flex flex-col relative">
      <ProgressBar isVisible={isNavigating} />
      <ToastProvider />
      <NetworkBanner />

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 glass border-b border-[var(--border-soft)] px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3 select-none">
          {/* Mobile Menu Toggle */}
          <MobileMenu />
          
          {/* Logo */}
          <div className="relative hidden md:block">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] flex items-center justify-center text-white font-black text-sm shadow-md">
              SP
            </div>
          </div>
          <div className="md:block">
            <div className="text-[15px] font-black text-[var(--text-primary)] tracking-tight leading-none">
              StellarPay <span className="text-gradient">Pro</span>
            </div>
            <div className="text-[10px] font-semibold text-[var(--text-hint)] tracking-wide">TESTNET</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <WalletButton onConnectClick={() => setIsHeroModalOpen(true)} />
          </div>
        </div>
      </header>

      {/* ── MAIN ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 w-full flex flex-col relative">

        {!isConnected ? (
          /* ── HERO (disconnected) ─────────────────────────────────────────── */
          <div className="flex-1 flex flex-col relative grain">
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[var(--accent-glow)] rounded-full blur-[120px] opacity-30 pointer-events-none" />
            
            <div className="py-20 sm:py-32 text-center max-w-4xl mx-auto px-4 relative z-10">
              <div className="stagger-in inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--accent-glow)] bg-[var(--accent-light)] text-xs font-bold text-[var(--accent)] mb-8 select-none shadow-sm">
                <span className="text-base">✦</span> Built on Stellar Testnet
              </div>

              <h1 className="stagger-in text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6" style={{ animationDelay: '100ms' }}>
                <span className="text-[var(--text-primary)]">Send XLM</span><br />
                <span className="text-gradient">Instantly.</span>
              </h1>

              <p className="stagger-in text-lg text-[var(--text-secondary)] font-medium max-w-md mx-auto mb-10 leading-relaxed" style={{ animationDelay: '200ms' }}>
                Connect your Stellar wallet to send payments, interact with smart contracts, and watch live on-chain events on Testnet.
              </p>

              <div className="stagger-in flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto" style={{ animationDelay: '300ms' }}>
                <button
                  id="hero-connect-btn"
                  onClick={() => setIsHeroModalOpen(true)}
                  className="btn-press btn-primary-glow w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-all focus:outline-none"
                >
                  Connect Wallet &rarr;
                </button>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full pb-20 px-4 relative z-10">
              {[
                { delay: 'animate-float', icon: '⚡', color: 'var(--accent-light)', title: 'Fast Transactions', desc: 'XLM payments finalise in 3–5 seconds via the Stellar Consensus Protocol.' },
                { delay: 'animate-float-delay-1', icon: '🔒', color: 'var(--success-light)', title: 'Non-Custodial', desc: 'Your keys never leave your wallet. Sign transactions locally with Freighter.' },
                { delay: 'animate-float-delay-2', icon: '🌐', color: '#F5F3FF', title: 'Live Events', desc: 'Watch Soroban smart contract events stream in from the testnet ledger.' },
              ].map((card) => (
                <div key={card.title} className={`${card.delay} glass bg-white/80 rounded-2xl p-6 flex flex-col gap-4 border border-[var(--border-soft)] shadow-sm`}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: card.color }}>
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--text-primary)]">{card.title}</h3>
                    <p className="text-sm text-[var(--text-secondary)] font-medium mt-1.5 leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ── DASHBOARD (connected) ─────────────────────────────────────── */
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-10 fade-in">
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-sm text-[var(--text-secondary)] font-bold mb-1">Welcome back,</p>
                <div className="text-2xl font-black text-[var(--accent)] tracking-tight">Testnet Explorer</div>
              </div>
            </div>

            {/* ── Main Grid ──────────────────────────────────────────────── */}
            <section>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <BalanceCard />
                    <div className="space-y-6">
                      <FaucetButton />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ErrorBoundary>
                      <SendPayment />
                    </ErrorBoundary>
                    <ErrorBoundary>
                      <PaymentSplitter />
                    </ErrorBoundary>
                  </div>

                  <SectionHeading label="HISTORY">Recent Transactions</SectionHeading>
                  <ErrorBoundary>
                    <TransactionHistory />
                  </ErrorBoundary>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-1 space-y-6">
                  <ErrorBoundary>
                    <ContractCounter />
                  </ErrorBoundary>
                  
                  <ErrorBoundary>
                    <ActivityFeed />
                  </ErrorBoundary>
                </div>

              </div>
            </section>

          </div>
        )}
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="mt-auto border-t border-[var(--border-soft)] bg-[var(--bg-surface)] px-6 py-6 text-center z-10">
        <div className="text-xs text-[var(--text-secondary)] font-medium space-y-3">
          <div className="flex items-center justify-center gap-4">
            <span className="font-bold text-[var(--text-primary)]">StellarPay Pro</span>
            <span className="text-[var(--border-medium)]">|</span>
            <span>Stellar Testnet</span>
            <span className="text-[var(--border-medium)]">|</span>
            <span className="text-[var(--warning)] font-bold">Not for real funds</span>
          </div>
          <div className="flex items-center justify-center gap-4">
            <span className="hidden sm:inline bg-[var(--bg-elevated)] px-2 py-1 rounded-md text-[var(--text-hint)] font-bold text-[10px] tracking-wider">
              CMD+K TO CONNECT
            </span>
            <span className="hidden sm:inline bg-[var(--bg-elevated)] px-2 py-1 rounded-md text-[var(--text-hint)] font-bold text-[10px] tracking-wider">
              ESC TO CLOSE
            </span>
          </div>
        </div>
      </footer>

      {/* Hero wallet modal */}
      <WalletModal
        isOpen={isHeroModalOpen}
        onClose={() => setIsHeroModalOpen(false)}
        onSelect={(walletId) => connect(walletId)}
      />
    </div>
  )
}
