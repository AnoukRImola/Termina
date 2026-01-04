'use client';

import { createContext, useContext, useCallback, useState, useEffect, ReactNode } from 'react';
import type { CasperContextType, CasperAccount } from './types';

// Casper Wallet Provider types (injected by browser extension)
interface SignatureResponse {
  cancelled: boolean;
  signatureHex?: string;
  signature?: Uint8Array;
}

interface CasperWalletProviderType {
  requestConnection: () => Promise<boolean>;
  disconnectFromSite: () => Promise<boolean>;
  isConnected: () => Promise<boolean>;
  getActivePublicKey: () => Promise<string>;
  sign: (deployJson: string, signingPublicKeyHex: string) => Promise<SignatureResponse>;
  signMessage: (message: string, signingPublicKeyHex: string) => Promise<SignatureResponse>;
}

interface CasperWalletEventDetail {
  isConnected?: boolean;
  isUnlocked?: boolean;
  activeKey?: string;
}

declare global {
  interface Window {
    CasperWalletProvider?: () => CasperWalletProviderType;
    CasperWalletEventTypes?: {
      Connected: string;
      Disconnected: string;
      ActiveKeyChanged: string;
      Locked: string;
      Unlocked: string;
    };
  }
}

const CasperContext = createContext<CasperContextType | null>(null);

interface CasperProviderProps {
  children: ReactNode;
}

export function CasperProvider({ children }: CasperProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState<CasperAccount | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<CasperWalletProviderType | null>(null);

  // Initialize wallet provider
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initProvider = async () => {
      // Wait for the wallet extension to inject the provider
      const waitForProvider = (retries = 10): Promise<CasperWalletProviderType | null> => {
        return new Promise((resolve) => {
          if (window.CasperWalletProvider) {
            resolve(window.CasperWalletProvider());
          } else if (retries > 0) {
            setTimeout(() => resolve(waitForProvider(retries - 1)), 200);
          } else {
            resolve(null);
          }
        });
      };

      const walletProvider = await waitForProvider();

      if (!walletProvider) {
        // Wallet extension not installed - this is fine, user can install it later
        console.log('Casper Wallet extension not detected');
        return;
      }

      setProvider(walletProvider);

      // Check if already connected
      try {
        const connected = await walletProvider.isConnected();
        if (connected) {
          const publicKey = await walletProvider.getActivePublicKey();
          setAccount({
            publicKey,
            provider: 'casper-wallet',
          });
          setIsConnected(true);
        }
      } catch (err) {
        console.error('Error checking connection:', err);
      }
    };

    initProvider();

    // Listen for wallet events
    const handleWalletEvent = (event: CustomEvent<CasperWalletEventDetail>) => {
      const { activeKey, isConnected: connected } = event.detail || {};

      if (connected === false) {
        setAccount(null);
        setIsConnected(false);
      } else if (activeKey) {
        setAccount({
          publicKey: activeKey,
          provider: 'casper-wallet',
        });
        setIsConnected(true);
      }
    };

    // Add event listeners for wallet events
    window.addEventListener('casper-wallet:connected', handleWalletEvent as EventListener);
    window.addEventListener('casper-wallet:disconnected', handleWalletEvent as EventListener);
    window.addEventListener('casper-wallet:activeKeyChanged', handleWalletEvent as EventListener);

    return () => {
      window.removeEventListener('casper-wallet:connected', handleWalletEvent as EventListener);
      window.removeEventListener('casper-wallet:disconnected', handleWalletEvent as EventListener);
      window.removeEventListener('casper-wallet:activeKeyChanged', handleWalletEvent as EventListener);
    };
  }, []);

  const connect = useCallback(async () => {
    if (!provider) {
      // Open Casper Wallet download page if not installed
      window.open('https://www.casperwallet.io/download', '_blank');
      setError('Please install Casper Wallet extension');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const connected = await provider.requestConnection();

      if (connected) {
        const publicKey = await provider.getActivePublicKey();
        setAccount({
          publicKey,
          provider: 'casper-wallet',
        });
        setIsConnected(true);
      } else {
        setError('Connection request was rejected');
      }
    } catch (err) {
      console.error('Connection failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, [provider]);

  const disconnect = useCallback(async () => {
    if (!provider) return;

    try {
      await provider.disconnectFromSite();
      setAccount(null);
      setIsConnected(false);
      setError(null);
    } catch (err) {
      console.error('Disconnect failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    }
  }, [provider]);

  const signMessage = useCallback(async (message: string): Promise<string | null> => {
    if (!provider || !account) {
      setError('No wallet connected');
      return null;
    }

    try {
      const result = await provider.signMessage(message, account.publicKey);
      if (result.cancelled) {
        setError('Signing was cancelled');
        return null;
      }
      return result.signatureHex || null;
    } catch (err) {
      console.error('Sign message failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign message');
      return null;
    }
  }, [provider, account]);

  const signAndSendDeploy = useCallback(async (deploy: unknown): Promise<string | null> => {
    if (!provider || !account) {
      setError('No wallet connected');
      return null;
    }

    try {
      const deployJson = typeof deploy === 'string' ? deploy : JSON.stringify(deploy);
      const result = await provider.sign(deployJson, account.publicKey);

      if (result.cancelled) {
        setError('Transaction was cancelled');
        return null;
      }

      // Note: The Casper Wallet only signs, it doesn't send.
      // The signed deploy needs to be sent to the network separately.
      // For now, return the signature as confirmation
      return result.signatureHex || 'signed';
    } catch (err) {
      console.error('Deploy failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign transaction');
      return null;
    }
  }, [provider, account]);

  const value: CasperContextType = {
    isConnected,
    isConnecting,
    account,
    error,
    connect,
    disconnect,
    signMessage,
    signAndSendDeploy,
  };

  return (
    <CasperContext.Provider value={value}>
      {children}
    </CasperContext.Provider>
  );
}

export function useCasper(): CasperContextType {
  const context = useContext(CasperContext);
  if (!context) {
    throw new Error('useCasper must be used within a CasperProvider');
  }
  return context;
}
