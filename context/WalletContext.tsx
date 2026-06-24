'use client';
import '@/lib/shim';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  StellarWalletsKit,
} from '@creit.tech/stellar-wallets-kit';
import { FREIGHTER_ID, FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull';
import { AlbedoModule } from '@creit.tech/stellar-wallets-kit/modules/albedo';
import { LobstrModule } from '@creit.tech/stellar-wallets-kit/modules/lobstr';
import { getXLMBalance } from '@/lib/stellar';
import { showToast } from '@/components/ui/Toast';

interface WalletContextType {
  publicKey: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  connectWallet: (walletId?: string) => Promise<void>;
  disconnectWallet: () => void;
  kit: any | null;
  // Aliases and state for existing app components
  connect: (walletId?: string) => Promise<void>;
  disconnect: () => void;
  balance: string;
  network: string;
  refreshBalance: () => Promise<void>;
  walletId: string | null;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [kit, setKit] = useState<any | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState('0.0000');
  const [walletId, setWalletId] = useState<string | null>(null);
  const network = 'TESTNET';

  // Initialize kit only in browser
  useEffect(() => {
    try {
      StellarWalletsKit.init({
        network: 'Test SDF Network ; September 2015' as any,
        selectedWalletId: FREIGHTER_ID,
        modules: [
          new FreighterModule(),
          new xBullModule(),
          new AlbedoModule(),
          new LobstrModule(),
        ],
      });
    } catch (e) {}
    setKit(() => StellarWalletsKit);
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!publicKey) return;
    try {
      const bal = await getXLMBalance(publicKey);
      setBalance(bal);
    } catch (e) {
      console.error(e);
    }
  }, [publicKey]);

  const connectWallet = useCallback(async (selectedWalletId?: string) => {
    if (!kit) return;
    setIsLoading(true);
    setError(null);
    try {
      // Show wallet selector modal if no walletId given
      if (!selectedWalletId) {
        const { address } = await kit.authModal();
        setPublicKey(address);
        setIsConnected(true);
        const wid = kit.selectedModule?.id || 'freighter';
        setWalletId(wid);
        localStorage.setItem('stellar_wallet_pk', address);
        localStorage.setItem('stellar_wallet_id', wid);
        try {
          const bal = await getXLMBalance(address);
          setBalance(bal);
        } catch (e) {}
        showToast('success', 'Wallet connected successfully!');
      } else {
        kit.setWallet(selectedWalletId);
        const { address } = await kit.getAddress();
        setPublicKey(address);
        setIsConnected(true);
        setWalletId(selectedWalletId);
        localStorage.setItem('stellar_wallet_pk', address);
        localStorage.setItem('stellar_wallet_id', selectedWalletId);
        try {
          const bal = await getXLMBalance(address);
          setBalance(bal);
        } catch (e) {}
        showToast('success', 'Wallet connected successfully!');
      }
    } catch (err: unknown) {
      // Handle 3 required error types
      if (err instanceof Error) {
        if (err.message.includes('not found') || err.message.includes('install')) {
          setError('WALLET_NOT_FOUND: Please install the wallet extension and refresh.');
          showToast('error', 'WALLET_NOT_FOUND: Please install the wallet extension and refresh.');
        } else if (err.message.includes('rejected') || err.message.includes('denied')) {
          setError('CONNECTION_REJECTED: You rejected the connection request.');
          showToast('error', 'CONNECTION_REJECTED: You rejected the connection request.');
        } else if (err.message.includes('balance') || err.message.includes('insufficient')) {
          setError('INSUFFICIENT_BALANCE: Your account has insufficient funds.');
          showToast('error', 'INSUFFICIENT_BALANCE: Your account has insufficient funds.');
        } else {
          setError(`CONNECTION_ERROR: ${err.message}`);
          showToast('error', `CONNECTION_ERROR: ${err.message}`);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [kit]);

  const disconnectWallet = useCallback(() => {
    setPublicKey(null);
    setIsConnected(false);
    setError(null);
    setBalance('0.0000');
    setWalletId(null);
    localStorage.removeItem('stellar_wallet_pk');
    localStorage.removeItem('stellar_wallet_id');
    try {
      if (kit) kit.disconnect();
    } catch (e) {}
  }, [kit]);

  useEffect(() => {
    if (!kit) return;
    const pk = localStorage.getItem('stellar_wallet_pk');
    const wid = localStorage.getItem('stellar_wallet_id');
    if (pk && wid) {
      connectWallet(wid);
    }
  }, [kit, connectWallet]);

  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(refreshBalance, 15000);
    return () => clearInterval(interval);
  }, [isConnected, refreshBalance]);

  return (
    <WalletContext.Provider value={{
      publicKey,
      isConnected,
      isLoading,
      error,
      connectWallet,
      disconnectWallet,
      kit,
      connect: connectWallet,
      disconnect: disconnectWallet,
      balance,
      network,
      refreshBalance,
      walletId
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}

