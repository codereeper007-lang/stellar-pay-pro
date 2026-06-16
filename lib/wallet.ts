import { StellarWalletsKit, Networks } from '@creit-tech/stellar-wallets-kit'
import { FreighterModule, FREIGHTER_ID } from '@creit-tech/stellar-wallets-kit/modules/freighter'
import { xBullModule, XBULL_ID } from '@creit-tech/stellar-wallets-kit/modules/xbull'
import { AlbedoModule, ALBEDO_ID } from '@creit-tech/stellar-wallets-kit/modules/albedo'

if (typeof window !== 'undefined') {
  StellarWalletsKit.init({
    network: Networks.TESTNET,
    selectedWalletId: FREIGHTER_ID,
    modules: [
      new FreighterModule(),
      new xBullModule(),
      new AlbedoModule()
    ]
  })
}

export const kit = StellarWalletsKit

export async function connectWallet(walletId: string): Promise<{
  publicKey: string | null
  error: string | null
}> {
  try {
    kit.setWallet(walletId)
    const { address } = await kit.getAddress()
    localStorage.setItem('stellar_wallet_pk', address)
    localStorage.setItem('stellar_wallet_id', walletId)
    return { publicKey: address, error: null }
  } catch (e: any) {
    if (e?.message?.includes('rejected') ||
        e?.message?.includes('cancelled')) {
      return { publicKey: null, error: 'UserRejected' }
    }
    return { publicKey: null, error: e?.message || 'Connection failed' }
  }
}

export async function signWithKit(
  transactionXDR: string,
  publicKey: string
): Promise<string> {
  const { signedTxXdr } = await kit.signTransaction(transactionXDR, {
    networkPassphrase: 'Test SDF Network ; September 2015',
    address: publicKey
  })
  return signedTxXdr
}

export function disconnectWallet(): void {
  localStorage.removeItem('stellar_wallet_pk')
  localStorage.removeItem('stellar_wallet_id')
}
