import '@/lib/shim'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalletProvider } from '@/context/WalletContext'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'StellarPay Pro — Stellar Testnet dApp',
  description: 'Send XLM, interact with smart contracts, and explore real-time on-chain activity on the Stellar Testnet.',
  keywords: ['Stellar', 'XLM', 'Soroban', 'Testnet', 'dApp', 'Smart Contracts'],
  openGraph: {
    title: 'StellarPay Pro',
    description: 'Stellar Testnet dApp — Send XLM, Smart Contracts, Real-time Events',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased">
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  )
}
