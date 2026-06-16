'use client'
import React, { useState, useEffect } from 'react'
import { useWallet } from '@/context/WalletContext'
import { getRecentTransactions } from '@/lib/stellar'
import type { StellarTransaction } from '@/types'
import { copyToClipboard } from '@/lib/clipboard'
import { Badge } from '@/components/ui/Badge'
import { SkeletonText } from '@/components/ui/Skeleton'

export function TransactionHistory() {
  const { publicKey, balance } = useWallet()
  const [transactions, setTransactions] = useState<StellarTransaction[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      if (!publicKey) { setTransactions([]); return }
      setLoading(true)
      try {
        // Fetch 10 transactions
        setTransactions(await getRecentTransactions(publicKey, 10))
      } catch { /* non-fatal */ } finally {
        setLoading(false)
      }
    }
    load()
  }, [publicKey, balance])

  const fmtHash = (h: string) => `${h.slice(0, 6)}…${h.slice(-6)}`
  
  // Format relative time (e.g. "2 minutes ago")
  const timeAgo = (dateStr: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000)
    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + ' years ago'
    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + ' months ago'
    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + ' days ago'
    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + ' hours ago'
    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + ' minutes ago'
    if (seconds < 10) return 'Just now'
    return Math.floor(seconds) + ' seconds ago'
  }

  return (
    <div className="premium-card overflow-hidden w-full overflow-x-auto">
      {loading ? (
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <SkeletonText className="w-1/4 h-5" />
              <SkeletonText className="w-1/4 h-5" />
              <SkeletonText className="w-1/2 h-5" />
            </div>
          ))}
        </div>
      ) : transactions.length > 0 ? (
        <div className="min-w-[600px]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border-soft)] bg-[var(--bg-elevated)]">
                {['Hash', 'Type', 'Time', 'Status', ''].map((h) => (
                  <th key={h} className="px-5 py-3 text-[10px] font-bold text-[var(--text-hint)] uppercase tracking-widest whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-soft)]">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[var(--bg-elevated)] transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[var(--text-primary)] font-bold whitespace-nowrap">
                        {fmtHash(tx.hash)}
                      </span>
                      <button 
                        onClick={() => copyToClipboard(tx.hash)}
                        className="text-[var(--text-hint)] hover:text-[var(--accent)] transition-colors opacity-0 group-hover:opacity-100"
                        title="Copy Hash"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)] font-bold capitalize">
                      <svg className="w-4 h-4 text-[var(--text-hint)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      {tx.type}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[var(--text-secondary)] font-medium whitespace-nowrap">
                    {timeAgo(tx.createdAt)}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <Badge variant={tx.successful ? 'success' : 'error'}>
                      {tx.successful ? 'Confirmed' : 'Failed'}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <a href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] font-bold hover:text-[var(--accent-hover)] transition-colors inline-flex items-center gap-1">
                      Explorer
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center">
            <svg className="w-6 h-6 text-[var(--text-hint)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <div>
            <p className="text-base font-bold text-[var(--text-primary)]">No transactions yet on Testnet</p>
            <p className="text-sm text-[var(--text-secondary)] font-medium mt-1 max-w-xs mx-auto">
              Use the Send Payment form or fund from Faucet to get started.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
