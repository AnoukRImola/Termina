'use client';

import { useState } from 'react';
import { useCasper } from '@/lib/casper';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Wallet, ChevronDown, LogOut, Copy, Check, ExternalLink } from 'lucide-react';
import type { WalletProvider } from '@/lib/casper';

const walletProviders: { id: WalletProvider; name: string; icon: string }[] = [
  { id: 'casper-wallet', name: 'Casper Wallet', icon: '🔐' },
  { id: 'ledger', name: 'Ledger', icon: '🔑' },
  { id: 'casperdash', name: 'CasperDash', icon: '⚡' },
];

function truncateAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

function formatBalance(balance: string | undefined): string {
  if (!balance) return '0.00';
  const cspr = parseFloat(balance) / 1_000_000_000; // Convert motes to CSPR
  return cspr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function WalletConnect() {
  const { isConnected, isConnecting, account, error, connect, disconnect } = useCasper();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleConnect = async (provider: WalletProvider) => {
    await connect(provider);
    setShowDropdown(false);
  };

  const handleCopyAddress = async () => {
    if (account?.publicKey) {
      await navigator.clipboard.writeText(account.publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowWalletMenu(false);
  };

  if (isConnected && account) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowWalletMenu(!showWalletMenu)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-xs font-bold text-white">
              {account.publicKey.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-slate-900">
              {truncateAddress(account.publicKey)}
            </p>
            <p className="text-xs text-slate-500">
              {formatBalance(account.balance)} CSPR
            </p>
          </div>
          <ChevronDown className={cn(
            'w-4 h-4 text-slate-400 transition-transform',
            showWalletMenu && 'rotate-180'
          )} />
        </button>

        {showWalletMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowWalletMenu(false)}
            />
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-lg z-50 overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Connected Wallet</p>
                {account.name && (
                  <p className="text-sm font-medium text-slate-900 mb-1">{account.name}</p>
                )}
                <p className="text-sm text-slate-600 font-mono">
                  {truncateAddress(account.publicKey)}
                </p>
                <p className="text-lg font-bold text-slate-900 mt-2">
                  {formatBalance(account.balance)} <span className="text-sm font-normal text-slate-500">CSPR</span>
                </p>
              </div>

              <div className="p-2">
                <button
                  onClick={handleCopyAddress}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? 'Copied!' : 'Copy Address'}
                </button>
                <a
                  href={`https://testnet.cspr.live/account/${account.publicKey}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Explorer
                </a>
                <button
                  onClick={handleDisconnect}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isConnecting}
        variant="outline"
      >
        <Wallet className="w-4 h-4" />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        <ChevronDown className={cn(
          'w-4 h-4 transition-transform',
          showDropdown && 'rotate-180'
        )} />
      </Button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-lg z-50 overflow-hidden">
            <div className="p-3 border-b border-slate-100">
              <p className="text-sm font-medium text-slate-900">Connect Wallet</p>
              <p className="text-xs text-slate-500">Choose your preferred wallet</p>
            </div>
            <div className="p-2">
              {walletProviders.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => handleConnect(provider.id)}
                  disabled={isConnecting}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <span className="text-lg">{provider.icon}</span>
                  <span className="font-medium">{provider.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {error && (
        <p className="absolute top-full mt-2 right-0 text-xs text-red-600 whitespace-nowrap">
          {error}
        </p>
      )}
    </div>
  );
}
