export interface WalletState {
  publicKey: string | null
  isConnected: boolean
  isLoading: boolean
  balance: string
  network: string
  walletId: string | null
}

export interface TransactionResult {
  success: boolean
  hash: string | null
  error: string | null
}

export interface StellarTransaction {
  id: string
  hash: string
  type: string
  amount: string
  destination: string
  createdAt: string
  successful: boolean
}

export interface ContractEvent {
  id: string
  type: string
  value: string
  timestamp: Date
  txHash: string
}
