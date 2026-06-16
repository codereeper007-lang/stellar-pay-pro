import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

interface ButtonProps {
  children: React.ReactNode
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  type?: 'button' | 'submit'
  className?: string
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
  className = ''
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3730A3] disabled:opacity-50 disabled:cursor-not-allowed select-none'
  
  const variants = {
    primary: 'bg-[#3730A3] text-white hover:bg-[#312e81] focus:ring-[#3730A3]',
    secondary: 'bg-white border border-[#E7E5E4] text-[#1C1917] hover:bg-[#FAFAF9] focus:ring-[#E7E5E4]',
    ghost: 'bg-transparent text-[#78716C] hover:bg-[#F5F5F4] focus:ring-[#F5F5F4]',
    danger: 'bg-[#FEE2E2] text-[#991B1B] hover:bg-[#FECACA] focus:ring-[#991B1B]'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  const mergedClasses = twMerge(
    clsx(
      baseStyles,
      variants[variant],
      sizes[size],
      fullWidth && 'w-full',
      className
    )
  )

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={mergedClasses}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          role="status"
          aria-label="loading"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}
