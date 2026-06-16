'use client'
import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <div className="premium-card p-8 text-center max-w-md mx-auto ring-2 ring-red-200">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#FEE2E2] flex items-center justify-center mb-5">
              <svg className="w-8 h-8 text-[#991B1B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-[#1C1917] mb-2">Something went wrong</h2>
            <p className="text-sm text-[#78716C] font-medium mb-8">
              A rendering error occurred in this component.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="w-full px-4 py-3 rounded-xl text-sm font-bold text-[#1C1917] border border-[#E7E5E4] hover:bg-[#F5F5F4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
            >
              Reload View
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
