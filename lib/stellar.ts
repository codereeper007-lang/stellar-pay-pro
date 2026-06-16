import { Horizon, StrKey } from '@stellar/stellar-sdk'
import type { StellarTransaction } from '@/types'

const server = new Horizon.Server('https://horizon-testnet.stellar.org')

export async function getXLMBalance(publicKey: string): Promise<string> {
  try {
    const account = await server.loadAccount(publicKey)
    const native = account.balances.find(
      (b: any) => b.asset_type === 'native'
    )
    return native ? parseFloat(native.balance).toFixed(4) : '0.0000'
  } catch (e: any) {
    if (e?.response?.status === 404) return '0.0000'
    throw e
  }
}

export async function getRecentTransactions(
  publicKey: string,
  limit = 5
): Promise<StellarTransaction[]> {
  try {
    const result = await server
      .transactions()
      .forAccount(publicKey)
      .limit(limit)
      .order('desc')
      .call()
    return result.records.map((r: any) => ({
      id: r.id,
      hash: r.hash,
      type: 'payment',
      amount: '',
      destination: '',
      createdAt: r.created_at,
      successful: r.successful
    }))
  } catch {
    return []
  }
}

export function isValidStellarAddress(address: string): boolean {
  try {
    return StrKey.isValidEd25519PublicKey(address)
  } catch {
    return false
  }
}

export async function fundTestnetAccount(
  publicKey: string
): Promise<boolean> {
  try {
    const res = await fetch(
      `https://friendbot.stellar.org/?addr=${publicKey}`
    )
    return res.ok
  } catch {
    return false
  }
}
