// We use dynamic imports because StellarWalletsKit crashes during SSR (node env)
import { isConnected, requestAccess, signTransaction } from '@stellar/freighter-api'

let kitInstance: any = null

async function getKit() {
  if (kitInstance) return kitInstance

  const { StellarWalletsKit, Networks } = await import('@creit-tech/stellar-wallets-kit')
  const { xBullModule } = await import('@creit-tech/stellar-wallets-kit/modules/xbull')
  const { AlbedoModule } = await import('@creit-tech/stellar-wallets-kit/modules/albedo')

  // @ts-ignore: Version 2.3.0 types don't expect options but implementation does
  kitInstance = new StellarWalletsKit({
    network: Networks.TESTNET,
    selectedWalletId: 'xbull',
    modules: [
      new xBullModule(),
      new AlbedoModule()
    ]
  })
  
  return kitInstance
}

export async function connectWallet(walletId: string): Promise<{
  publicKey: string | null
  error: string | null
}> {
  try {
    if (walletId === 'freighter') {
      const installed = await isConnected()
      if (!installed) {
        return { publicKey: null, error: 'Freighter extension is not installed.' }
      }
      const { address, error } = await requestAccess()
      if (error || !address) {
        return { publicKey: null, error: error || 'UserRejected' }
      }
      localStorage.setItem('stellar_wallet_pk', address)
      localStorage.setItem('stellar_wallet_id', walletId)
      return { publicKey: address, error: null }
    } else {
      const kit = await getKit()
      kit.setWallet(walletId)
      const { address } = await kit.getAddress()
      localStorage.setItem('stellar_wallet_pk', address)
      localStorage.setItem('stellar_wallet_id', walletId)
      return { publicKey: address, error: null }
    }
  } catch (e: any) {
    if (e?.message?.includes('rejected') || e?.message?.includes('cancelled')) {
      return { publicKey: null, error: 'UserRejected' }
    }
    return { publicKey: null, error: e?.message || 'Connection failed' }
  }
}

export async function signWithKit(
  transactionXDR: string,
  publicKey: string
): Promise<string> {
  const walletId = localStorage.getItem('stellar_wallet_id')
  
  if (walletId === 'freighter') {
    const { signedTxXdr, error } = await signTransaction(transactionXDR, {
      networkPassphrase: 'Test SDF Network ; September 2015'
    })
    if (error || !signedTxXdr) {
      throw new Error(error || 'Failed to sign with Freighter')
    }
    return signedTxXdr
  } else {
    const kit = await getKit()
    const { signedTxXdr } = await kit.signTransaction(transactionXDR, {
      networkPassphrase: 'Test SDF Network ; September 2015',
      address: publicKey
    })
    return signedTxXdr
  }
}

export function disconnectWallet(): void {
  localStorage.removeItem('stellar_wallet_pk')
  localStorage.removeItem('stellar_wallet_id')
}
