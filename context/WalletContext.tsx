'use client'
import '@/lib/shim'
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode
} from 'react'
import { getXLMBalance } from '@/lib/stellar'
import { connectWallet, disconnectWallet, kit } from '@/lib/wallet'
import type { WalletState } from '@/types'

interface WalletContextType extends WalletState {
  connect: (walletId: string) => Promise<void>
  disconnect: () => void
  refreshBalance: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | null>(null)

const initial: WalletState = {
  publicKey: null,
  isConnected: false,
  isLoading: false,
  balance: '0.0000',
  network: 'TESTNET',
  walletId: null
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>(initial)

  const refreshBalance = useCallback(async () => {
    if (!state.publicKey) return
    const balance = await getXLMBalance(state.publicKey)
    setState(s => ({ ...s, balance }))
  }, [state.publicKey])

  const connect = async (walletId: string) => {
    setState(s => ({ ...s, isLoading: true }))
    const { publicKey, error } = await connectWallet(walletId)
    if (publicKey) {
      const balance = await getXLMBalance(publicKey)
      setState({
        publicKey,
        isConnected: true,
        isLoading: false,
        balance,
        network: 'TESTNET',
        walletId
      })
    } else {
      setState(s => ({ ...s, isLoading: false }))
    }
  }

  const disconnect = () => {
    disconnectWallet()
    setState(initial)
  }

  useEffect(() => {
    const pk = localStorage.getItem('stellar_wallet_pk')
    const wid = localStorage.getItem('stellar_wallet_id')
    if (pk && wid) {
      connect(wid)
    }
  }, [])

  useEffect(() => {
    if (!state.isConnected) return
    const interval = setInterval(refreshBalance, 15000)
    return () => clearInterval(interval)
  }, [state.isConnected, refreshBalance])

  return (
    <WalletContext.Provider
      value={{ ...state, connect, disconnect, refreshBalance }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider')
  return ctx
}
