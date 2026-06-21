import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import { FreighterModule, FREIGHTER_ID } from '@creit.tech/stellar-wallets-kit/modules/freighter'
import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull'
import { AlbedoModule } from '@creit.tech/stellar-wallets-kit/modules/albedo'

StellarWalletsKit.init({
  network: 'Test SDF Network ; September 2015' as any,
  selectedWalletId: FREIGHTER_ID,
  modules: [
    new FreighterModule(),
    new xBullModule(),
    new AlbedoModule()
  ]
})

export const kit = StellarWalletsKit;

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
    return { publicKey: null, error: e?.message || 'Connection failed' }
  }
}

export function disconnectWallet(): void {
  localStorage.removeItem('stellar_wallet_pk')
  localStorage.removeItem('stellar_wallet_id')
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
