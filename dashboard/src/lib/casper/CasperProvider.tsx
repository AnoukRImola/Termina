'use client';

import { createContext, useContext, useCallback, useState, useEffect, ReactNode } from 'react';
import type { CasperContextType, CasperAccount, WalletProvider } from './types';

const CSPR_CLICK_APP_ID = 'termina-invoices';

const CasperContext = createContext<CasperContextType | null>(null);

interface CasperProviderProps {
  children: ReactNode;
}

export function CasperProvider({ children }: CasperProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState<CasperAccount | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [csprClick, setCsprClick] = useState<any>(null);

  // Initialize CSPR.click on mount
  useEffect(() => {
    // Skip initialization on server side
    if (typeof window === 'undefined') return;

    const initCsprClick = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const { CSPRClickSDK } = await import('@make-software/csprclick-core-client');
        const { CONTENT_MODE } = await import('@make-software/csprclick-core-types');

        const client = new CSPRClickSDK();
        client.init({
          appName: 'Termina',
          appId: CSPR_CLICK_APP_ID,
          contentMode: CONTENT_MODE.IFRAME,
          providers: ['casper-wallet', 'ledger', 'casperdash'],
        });

        // Check for existing session
        const existingAccount = client.getActiveAccount();
        if (existingAccount) {
          setAccount({
            publicKey: existingAccount.public_key,
            balance: existingAccount.balance,
            provider: existingAccount.provider || 'unknown',
            name: existingAccount.name || undefined,
          });
          setIsConnected(true);
        }

        // Listen for account changes
        client.on('csprclick:signed_in', (evt: any) => {
          const acc = evt.account;
          setAccount({
            publicKey: acc.public_key,
            balance: acc.balance,
            provider: acc.provider || 'unknown',
            name: acc.name || undefined,
          });
          setIsConnected(true);
          setError(null);
        });

        client.on('csprclick:signed_out', () => {
          setAccount(null);
          setIsConnected(false);
        });

        client.on('csprclick:disconnected', () => {
          setAccount(null);
          setIsConnected(false);
        });

        setCsprClick(client);
      } catch (err) {
        console.error('Failed to initialize CSPR.click:', err);
        setError('Failed to initialize wallet connection');
      }
    };

    initCsprClick();
  }, []);

  const connect = useCallback(async (provider: WalletProvider = 'casper-wallet') => {
    if (!csprClick) {
      setError('Wallet service not initialized');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const result = await csprClick.connect(provider);
      if (result) {
        setAccount({
          publicKey: result.public_key,
          balance: result.balance,
          provider: provider,
          name: result.name || undefined,
        });
        setIsConnected(true);
      }
    } catch (err: any) {
      console.error('Connection failed:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, [csprClick]);

  const disconnect = useCallback(() => {
    if (!csprClick) return;

    try {
      csprClick.signOut();
      setAccount(null);
      setIsConnected(false);
      setError(null);
    } catch (err: any) {
      console.error('Disconnect failed:', err);
      setError(err.message || 'Failed to disconnect');
    }
  }, [csprClick]);

  const signMessage = useCallback(async (message: string): Promise<string | null> => {
    if (!csprClick || !account) {
      setError('No wallet connected');
      return null;
    }

    try {
      const result = await csprClick.signMessage(message, account.publicKey);
      return result?.signature || null;
    } catch (err: any) {
      console.error('Sign message failed:', err);
      setError(err.message || 'Failed to sign message');
      return null;
    }
  }, [csprClick, account]);

  const signAndSendDeploy = useCallback(async (deploy: unknown): Promise<string | null> => {
    if (!csprClick || !account) {
      setError('No wallet connected');
      return null;
    }

    try {
      const result = await csprClick.send(deploy, account.publicKey);
      return result?.deployHash || null;
    } catch (err: any) {
      console.error('Deploy failed:', err);
      setError(err.message || 'Failed to send transaction');
      return null;
    }
  }, [csprClick, account]);

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
