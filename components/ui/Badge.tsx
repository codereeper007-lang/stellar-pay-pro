import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral'
  className?: string
}

export function Badge({
  children,
  variant = 'neutral',
  className = ''
}: BadgeProps) {
  const variants = {
    success: 'bg-[#DCFCE7] text-[#166534]',
    error: 'bg-[#FEE2E2] text-[#991B1B]',
    warning: 'bg-[#FEF3C7] text-[#92400E]',
    info: 'bg-[#EEF2FF] text-[#3730A3]',
    neutral: 'bg-[#F5F5F4] text-[#1C1917]'
  }

  const mergedClasses = twMerge(
    clsx(
      'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium select-none',
      variants[variant],
      className
    )
  )

  return (
    <span className={mergedClasses}>
      {children}
    </span>
  )
}
