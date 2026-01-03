export interface CasperAccount {
  publicKey: string;
  balance?: string;
  provider: string;
  name?: string;
}

export interface CasperWalletState {
  isConnected: boolean;
  isConnecting: boolean;
  account: CasperAccount | null;
  error: string | null;
}

export type WalletProvider = 'casper-wallet' | 'ledger' | 'metamask-snap' | 'casperdash';

export interface CasperContextType extends CasperWalletState {
  connect: (provider?: WalletProvider) => Promise<void>;
  disconnect: () => void;
  signMessage: (message: string) => Promise<string | null>;
  signAndSendDeploy: (deploy: unknown) => Promise<string | null>;
}
