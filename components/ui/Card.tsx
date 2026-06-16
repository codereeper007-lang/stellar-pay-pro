import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

export function Card({
  children,
  className = '',
  padding = 'md',
  hover = false
}: CardProps) {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  const mergedClasses = twMerge(
    clsx(
      'bg-white border border-[#E7E5E4] rounded-2xl shadow-sm overflow-hidden transition-all duration-200',
      paddings[padding],
      hover && 'hover:shadow-md hover:border-[#D6D3D1]',
      className
    )
  )

  return (
    <div className={mergedClasses}>
      {children}
    </div>
  )
}
