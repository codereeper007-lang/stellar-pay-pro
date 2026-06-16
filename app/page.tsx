'use client'
import React, { useState, useEffect } from 'react'
import { useWallet } from '@/context/WalletContext'
import { getRecentTransactions } from '@/lib/stellar'
import type { StellarTransaction } from '@/types'
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
import { Badge } from '@/components/ui/Badge'
import { SkeletonText } from '@/components/ui/Skeleton'

function SectionHeading({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="flex-1 h-px bg-[#E7E5E4]" />
      <div className="text-center">
        <div className="section-label mb-0.5">{label}</div>
        <div className="text-base font-bold text-[#1C1917]">{children}</div>
      </div>
      <div className="flex-1 h-px bg-[#E7E5E4]" />
    </div>
  )
}

export default function Home() {
  const { publicKey, isConnected, balance, connect } = useWallet()
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false)
  const [transactions, setTransactions] = useState<StellarTransaction[]>([])
  const [loadingTx, setLoadingTx] = useState(false)

  useEffect(() => {
    async function load() {
      if (!publicKey) { setTransactions([]); return }
      setLoadingTx(true)
      try {
        setTransactions(await getRecentTransactions(publicKey, 5))
      } catch { /* non-fatal */ } finally {
        setLoadingTx(false)
      }
    }
    load()
  }, [publicKey, balance])

  const fmtHash = (h: string) => `${h.slice(0, 6)}…${h.slice(-6)}`
  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) }
    catch { return d }
  }

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 glass-card border-b border-[#E7E5E4]/80 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3 select-none">
          {/* Mobile Menu Toggle */}
          <MobileMenu />
          
          {/* Logo */}
          <div className="relative hidden md:block">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3730A3] to-[#4F46E5] flex items-center justify-center text-white font-black text-sm shadow-md">
              SP
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
          </div>
          <div className="md:block">
            <div className="text-[15px] font-black text-[#1C1917] tracking-tight leading-none">
              StellarPay <span className="gradient-text">Pro</span>
            </div>
            <div className="text-[10px] font-semibold text-[#78716C] tracking-wide">TESTNET</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isConnected && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#78716C] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Stellar Testnet
            </div>
          )}
          <div className="hidden md:block">
            <WalletButton />
          </div>
        </div>
      </header>

      {/* ── MAIN ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col px-4 sm:px-6 overflow-x-hidden">

        {!isConnected ? (
          /* ── HERO (disconnected) ─────────────────────────────────────────── */
          <div className="flex-1 flex flex-col">
            <div className="py-16 sm:py-28 text-center max-w-3xl mx-auto fade-in px-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#3730A3]/20 bg-[#EEF2FF] text-[10px] sm:text-xs font-bold text-[#3730A3] mb-8 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3730A3] live-dot" />
                Stellar Soroban Smart Contracts · Testnet
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#1C1917] tracking-tight leading-[1.1] mb-6">
                Send XLM &amp;{' '}
                <span className="gradient-text">Interact</span>
                <br className="hidden sm:block" />
                with Smart Contracts
              </h1>

              <p className="text-sm sm:text-lg text-[#78716C] font-medium max-w-xl mx-auto mb-10 leading-relaxed px-4 sm:px-0">
                Connect your Stellar wallet to send payments, increment on-chain counters,
                and watch live contract events stream in — all on Testnet.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto px-4 sm:px-0">
                <button
                  id="hero-connect-btn"
                  onClick={() => setIsHeroModalOpen(true)}
                  className="w-full sm:w-auto px-8 py-3.5 min-h-[44px] rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#3730A3] to-[#4F46E5] hover:from-[#312e81] hover:to-[#4338CA] shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-[#3730A3] focus:ring-offset-2 select-none"
                >
                  Connect Wallet
                </button>
                <a
                  href="https://stellar.expert/explorer/testnet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 min-h-[44px] rounded-xl text-sm font-bold text-[#78716C] border border-[#E7E5E4] bg-white hover:bg-[#FAFAF9] hover:border-[#D6D3D1] transition-all select-none block"
                >
                  Explore Testnet →
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto w-full pb-16 fade-in">
              {[
                {
                  icon: '⚡', color: '#EEF2FF', title: 'Instant Settlement',
                  desc: 'XLM payments finalise in 3–5 seconds via the Stellar Consensus Protocol.',
                },
                {
                  icon: '🔒', color: '#DCFCE7', title: 'Non-Custodial',
                  desc: 'Your keys never leave your wallet. Sign transactions locally with Freighter, xBull, or Albedo.',
                },
                {
                  icon: '📡', color: '#F5F3FF', title: 'Live Contract Events',
                  desc: 'Watch Soroban smart contract events stream in from the testnet ledger in real time.',
                },
              ].map(({ icon, color, title, desc }) => (
                <div key={title} className="premium-card p-6 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: color }}>
                    {icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1C1917]">{title}</h3>
                    <p className="text-xs text-[#78716C] font-medium mt-1 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ── DASHBOARD (connected) ─────────────────────────────────────── */
          <div className="py-6 space-y-10">

            {/* ── Level 1 & 3: Balance, Send, Split ─────────────────────── */}
            <section>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                {/* Left col */}
                <div className="space-y-6">
                  <BalanceCard />
                  <FaucetButton />
                </div>
                {/* Mid col */}
                <div className="md:col-span-1 lg:col-span-1">
                  <ErrorBoundary>
                    <SendPayment />
                  </ErrorBoundary>
                </div>
                {/* Right col */}
                <div className="md:col-span-2 lg:col-span-1">
                  <ErrorBoundary>
                    <PaymentSplitter />
                  </ErrorBoundary>
                </div>
              </div>
            </section>

            {/* ── Level 2: Smart Contract & Activity ─────────────────────── */}
            <section>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="space-y-6">
                  <SectionHeading label="SMART CONTRACT">On-Chain Counter</SectionHeading>
                  <ErrorBoundary>
                    <ContractCounter />
                  </ErrorBoundary>
                </div>
                <div className="space-y-6">
                  <SectionHeading label="LIVE ACTIVITY">Contract Event Stream</SectionHeading>
                  <ErrorBoundary>
                    <ActivityFeed />
                  </ErrorBoundary>
                </div>
              </div>
            </section>

            {/* ── Recent Transactions ───────────────────────────────────── */}
            <section className="pb-10">
              <SectionHeading label="HISTORY">Recent Transactions</SectionHeading>
              <div className="premium-card overflow-hidden w-full overflow-x-auto">
                {loadingTx ? (
                  <div className="p-6 space-y-3">
                    <SkeletonText lines={3} />
                  </div>
                ) : transactions.length > 0 ? (
                  <div className="min-w-[600px]">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#E7E5E4] bg-[#FAFAF9]">
                          {['Hash', 'Type', 'Date', 'Status', 'Explorer'].map((h) => (
                            <th key={h} className="px-4 sm:px-5 py-3 text-[10px] font-bold text-[#78716C] uppercase tracking-widest whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E7E5E4]/60">
                        {transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-[#FAFAF9] transition-colors group">
                            <td className="px-4 sm:px-5 py-4 font-mono text-[#1C1917] font-semibold whitespace-nowrap">
                              {fmtHash(tx.hash)}
                            </td>
                            <td className="px-4 sm:px-5 py-4 text-[#78716C] font-medium capitalize whitespace-nowrap">Payment</td>
                            <td className="px-4 sm:px-5 py-4 text-[#78716C] font-medium whitespace-nowrap">{fmtDate(tx.createdAt)}</td>
                            <td className="px-4 sm:px-5 py-4 whitespace-nowrap">
                              <Badge variant={tx.successful ? 'success' : 'error'}>
                                {tx.successful ? 'Success' : 'Failed'}
                              </Badge>
                            </td>
                            <td className="px-4 sm:px-5 py-4 text-right whitespace-nowrap">
                              <a href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="text-[#3730A3] font-bold hover:underline inline-flex items-center gap-1">
                                View
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-14 px-4 text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#F5F5F4] flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#78716C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1C1917]">No transactions yet</p>
                      <p className="text-xs text-[#78716C] font-medium mt-0.5 max-w-xs mx-auto">
                        Use the Send Payment form or fund from Faucet to get started.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="mt-auto border-t border-[#E7E5E4] bg-white/60 backdrop-blur-sm px-6 py-5 text-center">
        <div className="text-xs text-[#78716C] font-medium space-y-2">
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap leading-relaxed">
            <span className="font-bold text-[#1C1917]">StellarPay Pro</span>
            <span className="text-[#E7E5E4] hidden sm:inline">·</span>
            <span className="block sm:inline">Stellar Testnet</span>
            <span className="text-[#E7E5E4] hidden sm:inline">·</span>
            <span className="text-amber-700 font-semibold block sm:inline w-full sm:w-auto">Not for real funds</span>
          </div>
          <div className="flex items-center justify-center gap-3 pt-1">
            <a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noopener noreferrer" className="text-[#3730A3] hover:underline font-semibold">Stellar Expert</a>
            <span className="text-[#E7E5E4]">·</span>
            <a href="https://developers.stellar.org" target="_blank" rel="noopener noreferrer" className="text-[#3730A3] hover:underline font-semibold">Stellar Docs</a>
            <span className="text-[#E7E5E4]">·</span>
            <a href="https://soroban.stellar.org" target="_blank" rel="noopener noreferrer" className="text-[#3730A3] hover:underline font-semibold">Soroban</a>
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
