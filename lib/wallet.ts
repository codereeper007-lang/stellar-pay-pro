import {
  isConnected,
  requestAccess as getPublicKey,
  isAllowed,
  setAllowed,
  signTransaction
} from '@stellar/freighter-api'

export function checkFreighterInstalled(): boolean {
  return typeof window !== 'undefined' &&
         typeof (window as any).freighter !== 'undefined'
}

export async function connectWallet(): Promise<{
  publicKey: string | null
  error: string | null
}> {
  try {
    const connected = await isConnected()
    if (!connected) {
      return { publicKey: null, error: 'Freighter not installed' }
    }
    const allowed = await isAllowed()
    if (!allowed) {
      await setAllowed()
    }
    const result: any = await getPublicKey()
    const publicKey = result.address || result
    localStorage.setItem('stellar_wallet_pk', publicKey)
    return { publicKey, error: null }
  } catch (e: any) {
    return { publicKey: null, error: e?.message || 'Connection failed' }
  }
}

export function disconnectWallet(): void {
  localStorage.removeItem('stellar_wallet_pk')
}

export async function signTx(
  transactionXDR: string,
  networkPassphrase: string
): Promise<string> {
  const result: any = await signTransaction(transactionXDR, { networkPassphrase })
  return result.signedTxXdr || result
}

export async function signWithKit(transactionXDR: string, publicKey: string): Promise<string> {
  return signTx(transactionXDR, 'Test SDF Network ; September 2015')
}
