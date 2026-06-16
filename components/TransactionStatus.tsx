'use client'
import React, { useState, useEffect } from 'react'
import { Horizon } from '@stellar/stellar-sdk'
import { Card } from './ui/Card'

interface TransactionStatusProps {
  txHash: string
  onComplete?: (success: boolean) => void
}

export function TransactionStatus({ txHash, onComplete }: TransactionStatusProps) {
  const [status, setStatus] = useState<'submitted' | 'processing' | 'confirmed' | 'failed'>('processing')
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    const server = new Horizon.Server('https://horizon-testnet.stellar.org')
    
    // Interval for polling Horizon every 3 seconds
    const pollInterval = setInterval(async () => {
      try {
        const txRecord = await server.transactions().transaction(txHash).call()
        clearInterval(pollInterval)
        if (txRecord.successful) {
          setStatus('confirmed')
          onComplete?.(true)
        } else {
          setStatus('failed')
          onComplete?.(false)
        }
      } catch (err: any) {
        // Horizon returns 404 if the transaction hasn't been indexed/processed yet
        if (err?.response?.status !== 404) {
          clearInterval(pollInterval)
          setStatus('failed')
          onComplete?.(false)
        }
      }
    }, 3000)

    // Interval for tracking elapsed seconds
    const timerInterval = setInterval(() => {
      setStatus((currentStatus) => {
        if (currentStatus === 'processing') {
          setElapsedTime((prev) => prev + 1)
        } else {
          clearInterval(timerInterval)
        }
        return currentStatus
      })
    }, 1000)

    return () => {
      clearInterval(pollInterval)
      clearInterval(timerInterval)
    }
  }, [txHash, onComplete])

  return (
    <Card className="w-full max-w-md mx-auto p-6 select-none fade-in">
      <h3 className="text-base font-bold text-[#1C1917] mb-6">Transaction Tracking</h3>

      {/* Timeline UI */}
      <div className="relative flex flex-col gap-6 pl-6 border-l border-[#E7E5E4] py-1">
        {/* Step 1: Submitted */}
        <div className="relative">
          <div className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-[#166534] bg-[#166534] text-white">
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold text-[#78716C]">Step 1: Submitted</div>
            <div className="text-xs text-[#78716C] mt-0.5">Transaction has been broadcasted.</div>
          </div>
        </div>

        {/* Step 2: Processing */}
        <div className="relative">
          <div
            className={`absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 ${
              status === 'processing'
                ? 'border-[#3730A3] bg-white animate-pulse'
                : 'border-[#166534] bg-[#166534] text-white'
            }`}
          >
            {status !== 'processing' ? (
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span className="w-2 h-2 rounded-full bg-[#3730A3] animate-ping" />
            )}
          </div>
          <div>
            <div
              className={`text-sm font-bold ${
                status === 'processing' ? 'text-[#3730A3]' : 'text-[#78716C]'
              }`}
            >
              Step 2: Processing
            </div>
            <div className="text-xs text-[#78716C] mt-0.5">
              {status === 'processing'
                ? 'Waiting for ledger consensus validation...'
                : 'Consensus complete.'}
            </div>
          </div>
        </div>

        {/* Step 3: Confirmed / Failed */}
        <div className="relative">
          <div
            className={`absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 ${
              status === 'confirmed'
                ? 'border-[#166534] bg-[#166534] text-white'
                : status === 'failed'
                ? 'border-[#991B1B] bg-[#991B1B] text-white'
                : 'border-[#E7E5E4] bg-white'
            }`}
          >
            {status === 'confirmed' && (
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {status === 'failed' && (
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <div>
            <div
              className={`text-sm font-bold ${
                status === 'confirmed'
                  ? 'text-[#166534]'
                  : status === 'failed'
                  ? 'text-[#991B1B]'
                  : 'text-[#78716C]'
              }`}
            >
              Step 3: {status === 'confirmed' ? 'Confirmed' : status === 'failed' ? 'Failed' : 'Ready'}
            </div>
            <div className="text-xs text-[#78716C] mt-0.5">
              {status === 'confirmed' && `Confirmed in ${elapsedTime} seconds.`}
              {status === 'failed' && 'Transaction failed during consensus.'}
              {status === 'processing' && `Awaiting block indexing (${elapsedTime}s elapsed)...`}
            </div>
          </div>
        </div>
      </div>

      {/* Explorer link */}
      {status !== 'processing' && (
        <div className="mt-8 border-t border-[#E7E5E4] pt-4 flex justify-between items-center text-xs">
          <span className="text-[#78716C] font-medium">Ledger Status</span>
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#3730A3] hover:underline font-bold"
          >
            View on Explorer →
          </a>
        </div>
      )}
    </Card>
  )
}
