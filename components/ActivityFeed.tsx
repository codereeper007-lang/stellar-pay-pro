'use client'
import React, { useState, useEffect, useRef } from 'react'
import { subscribeToEvents } from '@/lib/eventStream'
import { CONTRACT_IDS } from '@/lib/soroban'
import type { ContractEvent } from '@/types'

const MAX_EVENTS = 15

// Map event type prefixes to colours/labels
function getEventMeta(type: string): {
  bgColor: string
  textColor: string
  dotColor: string
  label: string
} {
  const upper = type.toUpperCase()
  if (upper.includes('INCREMENT') || upper.includes('COUNTER')) {
    return { bgColor: '#EEF2FF', textColor: '#3730A3', dotColor: '#4F46E5', label: 'INCREMENT' }
  }
  if (upper.includes('SPLIT') || upper.includes('SPLITTER')) {
    return { bgColor: '#F5F3FF', textColor: '#6D28D9', dotColor: '#7C3AED', label: 'SPLIT' }
  }
  if (upper.includes('TRANSFER') || upper.includes('TOKEN') || upper.includes('SDT') || upper.includes('REWARD')) {
    return { bgColor: '#DCFCE7', textColor: '#166534', dotColor: '#16A34A', label: 'TRANSFER' }
  }
  return { bgColor: '#F5F5F4', textColor: '#78716C', dotColor: '#A8A29E', label: 'EVENT' }
}

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000)
  if (secs < 5) return 'just now'
  if (secs < 60) return `${secs}s ago`
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  return `${Math.floor(secs / 3600)}h ago`
}

export function ActivityFeed() {
  const [events, setEvents] = useState<ContractEvent[]>([])
  const [ticker, setTicker] = useState(0) // force re-render for "X sec ago"

  // Tick every 5 seconds to refresh relative timestamps
  useEffect(() => {
    const t = setInterval(() => setTicker((n) => n + 1), 5000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const unsub = subscribeToEvents(
      Object.values(CONTRACT_IDS),
      (event) => {
        setEvents((prev) => [event, ...prev].slice(0, MAX_EVENTS))
      },
      5000
    )
    return unsub
  }, [])

  return (
    <div className="premium-card overflow-hidden fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E5E4]">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 live-dot" />
            <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />
          </div>
          <span className="text-sm font-bold text-[#1C1917]">Live Activity</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#78716C] font-medium">
            {events.length}/{MAX_EVENTS} events
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F5F5F4] text-[10px] font-bold text-[#78716C]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-dot inline-block" />
            LIVE
          </span>
        </div>
      </div>

      {/* Events list */}
      <div className="divide-y divide-[#E7E5E4]/60 max-h-[420px] overflow-y-auto">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            {/* Wave / pulse animation */}
            <div className="relative mb-5">
              <div className="w-14 h-14 rounded-full bg-[#EEF2FF] flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[#3730A3]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79" />
                </svg>
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white live-dot" />
            </div>
            <p className="text-sm font-semibold text-[#1C1917]">Listening for on-chain events…</p>
            <p className="text-xs text-[#78716C] mt-1 font-medium">
              Events from {Object.keys(CONTRACT_IDS).length} contracts will appear here in real time
            </p>
          </div>
        ) : (
          events.map((event, i) => {
            const meta = getEventMeta(event.type)
            const parts = event.type.split(':')
            const contractName = parts[0] || 'CONTRACT'
            const eventName = parts[1] || event.type

            return (
              <div
                key={event.id}
                className={`flex items-center gap-4 px-6 py-3.5 hover:bg-[#FAFAF9] transition-colors ${
                  i === 0 ? 'slide-from-top' : ''
                }`}
              >
                {/* Type badge */}
                <span
                  className="flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide"
                  style={{ backgroundColor: meta.bgColor, color: meta.textColor }}
                >
                  {meta.label}
                </span>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#1C1917] truncate">{contractName}</span>
                    <span className="text-[#78716C] text-xs">→</span>
                    <span className="text-xs font-medium text-[#78716C] truncate">{eventName}</span>
                  </div>
                  {event.value && (
                    <div className="text-[10px] text-[#78716C] font-mono mt-0.5 truncate">
                      {event.value}
                    </div>
                  )}
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] text-[#78716C] font-medium whitespace-nowrap">
                    {timeAgo(event.timestamp)}
                  </span>
                  {event.txHash && (
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${event.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#78716C] hover:text-[#3730A3] transition-colors"
                      title="View on Stellar Expert"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-[#E7E5E4] bg-[#FAFAF9] flex items-center justify-between">
        <span className="text-[10px] text-[#78716C] font-medium">
          Polling Soroban RPC every 5s · {Object.keys(CONTRACT_IDS).length} contracts monitored
        </span>
        <div
          className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-semibold"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-dot inline-block" />
          Connected
        </div>
      </div>
    </div>
  )
}
