'use client';

import { createContext, useContext, useCallback, useState, useEffect, ReactNode } from 'react';
import type { CasperContextType, CasperAccount, WalletProvider } from './types';

// Demo mode for hackathon - simulates wallet without actual SDK
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';
const CSPR_CLICK_APP_ID = 'termina-invoices';

const CasperContext = createContext<CasperContextType | null>(null);

interface CasperProviderProps {
  children: ReactNode;
}

// Demo account for testing
const DEMO_ACCOUNT: CasperAccount = {
  publicKey: '01a2b3c4d5e6f7890123456789abcdef01a2b3c4d5e6f7890123456789abcdef01',
  balance: '10000000000000', // 10,000 CSPR in motes
  provider: 'demo',
  name: 'Demo Account',
};

export function CasperProvider({ children }: CasperProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState<CasperAccount | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [csprClick, setCsprClick] = useState<any>(null);
  const [isDemoMode, setIsDemoMode] = useState(DEMO_MODE);

  // Initialize CSPR.click on mount (if not in demo mode)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isDemoMode) {
      console.log('Running in demo mode - wallet simulation enabled');
      return;
    }

    const initCsprClick = async () => {
      try {
        // Dynamic import - wrapped to prevent build-time resolution
        const clientModule = await import(
          /* webpackIgnore: true */
          '@make-software/csprclick-core-client'
        );
        const typesModule = await import(
          /* webpackIgnore: true */
          '@make-software/csprclick-core-types'
        );

        const { CSPRClickSDK } = clientModule;
        const { CONTENT_MODE } = typesModule;

        const client = new CSPRClickSDK();
        client.init({
          appName: 'Termina',
          appId: CSPR_CLICK_APP_ID,
          contentMode: CONTENT_MODE.IFRAME,
          providers: ['casper-wallet', 'ledger', 'casperdash'],
        });

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
        console.warn('CSPR.click SDK not available, switching to demo mode:', err);
        setIsDemoMode(true);
      }
    };

    initCsprClick();
  }, [isDemoMode]);

  const connect = useCallback(async (provider?: WalletProvider) => {
    setIsConnecting(true);
    setError(null);

    try {
      if (isDemoMode) {
        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setAccount(DEMO_ACCOUNT);
        setIsConnected(true);
        return;
      }

      if (!csprClick) {
        setError('Wallet service not initialized');
        return;
      }

      const result = await csprClick.connect(provider || 'casper-wallet');
      if (result) {
        setAccount({
          publicKey: result.public_key,
          balance: result.balance,
          provider: provider || 'casper-wallet',
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
  }, [csprClick, isDemoMode]);

  const disconnect = useCallback(() => {
    if (isDemoMode) {
      setAccount(null);
      setIsConnected(false);
      setError(null);
      return;
    }

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
  }, [csprClick, isDemoMode]);

  const signMessage = useCallback(async (message: string): Promise<string | null> => {
    if (isDemoMode) {
      // Return mock signature
      return `demo-signature-${Date.now()}`;
    }

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
  }, [csprClick, account, isDemoMode]);

  const signAndSendDeploy = useCallback(async (deploy: unknown): Promise<string | null> => {
    if (isDemoMode) {
      // Return mock deploy hash
      return `demo-deploy-${Date.now().toString(36)}`;
    }

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
  }, [csprClick, account, isDemoMode]);

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
