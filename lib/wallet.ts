import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import { FREIGHTER_ID, FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter'
import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull'
import { AlbedoModule } from '@creit.tech/stellar-wallets-kit/modules/albedo'
import { LobstrModule } from '@creit.tech/stellar-wallets-kit/modules/lobstr'

let isInitialized = false;

export function getKit(): any {
  if (!isInitialized) {
    try {
      StellarWalletsKit.init({
        network: 'Test SDF Network ; September 2015' as any,
        selectedWalletId: localStorage.getItem('stellar_wallet_id') || FREIGHTER_ID,
        modules: [
          new FreighterModule(),
          new xBullModule(),
          new AlbedoModule(),
          new LobstrModule(),
        ]
      });
      isInitialized = true;
    } catch (e) {}
  } else {
    const wid = localStorage.getItem('stellar_wallet_id');
    if (wid) {
      try {
        StellarWalletsKit.setWallet(wid);
      } catch (e) {}
    }
  }
  return StellarWalletsKit;
}

export const kit = {
  setWallet: (walletId: string) => getKit().setWallet(walletId),
  getAddress: () => getKit().getAddress(),
  signTransaction: (xdr: string, opts: any) => getKit().signTransaction(xdr, opts),
};

export async function connectWallet(walletId: string): Promise<{
  publicKey: string | null
  error: string | null
}> {
  try {
    const currentKit = getKit();
    currentKit.setWallet(walletId)
    const { address } = await currentKit.getAddress()
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
  const currentKit = getKit();
  const { signedTxXdr } = await currentKit.signTransaction(transactionXDR, {
    networkPassphrase: 'Test SDF Network ; September 2015',
    address: publicKey
  })
  return signedTxXdr
}
