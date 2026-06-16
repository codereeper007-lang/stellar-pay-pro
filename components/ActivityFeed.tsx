'use client'
import React, { useState, useEffect } from 'react'
import { subscribeToEvents } from '@/lib/eventStream'
import type { ContractEvent } from '@/types'

export function ActivityFeed() {
  const [events, setEvents] = useState<ContractEvent[]>([])

  useEffect(() => {
    const contractIds = [
      process.env.NEXT_PUBLIC_COUNTER_CONTRACT_ID || '',
      process.env.NEXT_PUBLIC_REWARD_CONTRACT_ADDRESS || '',
      process.env.NEXT_PUBLIC_PAYMENT_SPLITTER_ADDRESS || ''
    ].filter(Boolean)
    
    const cleanup = subscribeToEvents(contractIds, (event) => {
      setEvents((prev) => {
        if (prev.some(e => e.id === event.id)) return prev
        return [event, ...prev].slice(0, 50)
      })
    })
    return cleanup
  }, [])

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 5) return 'Just now'
    if (seconds < 60) return `${seconds}s ago`
    return `${Math.floor(seconds / 60)}m ago`
  }

  // Auto update relative times
  const [, setTick] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="premium-card p-0 flex flex-col max-h-[500px]">
      <div className="p-6 pb-4 border-b border-[var(--border-soft)] bg-white/50 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-[var(--text-primary)]">Live Feed</h3>
          <p className="text-xs text-[var(--text-secondary)] font-bold mt-1">Network Events</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center">
          <svg className="w-4 h-4 text-[var(--text-hint)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
      </div>

      <div className="overflow-y-auto p-4 flex-1 custom-scrollbar">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-[var(--text-hint)] space-y-4">
            {/* Animated waveform empty state */}
            <div className="flex items-end gap-1 h-8">
              <div className="w-1.5 bg-[var(--border-medium)] rounded-full animate-[float_1s_ease-in-out_infinite]" style={{ height: '40%' }} />
              <div className="w-1.5 bg-[var(--border-medium)] rounded-full animate-[float_1.2s_ease-in-out_infinite_0.1s]" style={{ height: '100%' }} />
              <div className="w-1.5 bg-[var(--border-medium)] rounded-full animate-[float_0.9s_ease-in-out_infinite_0.2s]" style={{ height: '60%' }} />
              <div className="w-1.5 bg-[var(--border-medium)] rounded-full animate-[float_1.1s_ease-in-out_infinite_0.3s]" style={{ height: '80%' }} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest">Waiting for on-chain events...</span>
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((e) => {
              const age = Math.floor((new Date().getTime() - e.timestamp.getTime()) / 1000)
              const isRecent = age < 5
              
              let colors = 'bg-[var(--bg-elevated)] border-[var(--border-soft)]'
              let dotColor = 'bg-[var(--border-medium)]'
              if (e.type === 'increment') {
                colors = 'bg-[#EEF2FF] border-[#C7D2FE] text-[#4338CA]'
                dotColor = 'bg-[#4338CA]'
              } else if (e.type === 'payment') {
                colors = 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]'
                dotColor = 'bg-[#15803D]'
              }

              return (
                <div key={e.id} className="slide-in-top p-3 rounded-2xl border bg-white shadow-sm flex items-start gap-3 hover:bg-[var(--bg-elevated)] transition-colors">
                  <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${dotColor} ${isRecent ? 'live-dot' : ''}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${colors}`}>
                        {e.type}
                      </span>
                      <span className="text-[10px] font-bold text-[var(--text-hint)] whitespace-nowrap">
                        {timeAgo(e.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                      {e.value || 'No additional data'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
