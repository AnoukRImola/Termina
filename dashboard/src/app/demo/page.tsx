'use client';

import { useState } from 'react';
import { useCasper } from '@/lib/casper/CasperProvider';
import { Wallet, FileText, CheckCircle, ArrowRight, ExternalLink, Loader2, AlertCircle } from 'lucide-react';

type EscrowStep = 'connect' | 'create' | 'processing' | 'complete';

interface TransactionResult {
  step: string;
  deployHash: string;
  status: 'pending' | 'success' | 'error';
}

export default function DemoPage() {
  const { isConnected, isConnecting, account, connect, error: walletError } = useCasper();
  const [currentStep, setCurrentStep] = useState<EscrowStep>('connect');
  const [invoiceData, setInvoiceData] = useState({
    description: '',
    amount: '3', // Default 3 CSPR for demo (minimum 2.5 CSPR)
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactions, setTransactions] = useState<TransactionResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    await connect();
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;

    setError(null);
    setIsProcessing(true);
    setCurrentStep('processing');
    setTransactions([]);

    try {
      // Call the backend to process the full escrow cycle
      const response = await fetch('/api/demo/escrow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          issuerAddress: account.publicKey,
          description: invoiceData.description || 'Demo Invoice',
          amount: parseFloat(invoiceData.amount) * 1_000_000_000, // Convert to motes
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process escrow');
      }

      // Update transactions as they come in
      setTransactions(data.transactions || []);
      setCurrentStep('complete');
    } catch (err) {
      console.error('Escrow error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process escrow');
      setCurrentStep('create');
    } finally {
      setIsProcessing(false);
    }
  };

  // Move to create step when connected
  if (isConnected && currentStep === 'connect') {
    setCurrentStep('create');
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[var(--background)] to-[var(--background-secondary)]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--primary-light)] text-[var(--casper-red)] rounded-full text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-[var(--casper-red)] rounded-full animate-pulse" />
            Live on Casper Testnet
          </div>
          <h1 className="text-3xl font-bold text-[var(--casper-dark)] mb-3">
            Try the Escrow Demo
          </h1>
          <p className="text-[var(--foreground-secondary)] max-w-xl mx-auto">
            Experience the full escrow lifecycle on Casper blockchain. Connect your wallet
            as the issuer, and our demo payer will automatically fund and release the escrow.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <StepIndicator
            step={1}
            label="Connect"
            active={currentStep === 'connect'}
            completed={currentStep !== 'connect'}
          />
          <div className="w-12 h-0.5 bg-[var(--border)]" />
          <StepIndicator
            step={2}
            label="Create"
            active={currentStep === 'create'}
            completed={currentStep === 'processing' || currentStep === 'complete'}
          />
          <div className="w-12 h-0.5 bg-[var(--border)]" />
          <StepIndicator
            step={3}
            label="Complete"
            active={currentStep === 'processing' || currentStep === 'complete'}
            completed={currentStep === 'complete'}
          />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl border border-[var(--border)] shadow-lg overflow-hidden">
          {/* Step 1: Connect Wallet */}
          {currentStep === 'connect' && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-[var(--primary-light)] rounded-full flex items-center justify-center mx-auto mb-6">
                <Wallet className="w-8 h-8 text-[var(--casper-red)]" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--casper-dark)] mb-2">
                Connect Your Wallet
              </h2>
              <p className="text-[var(--muted)] mb-6 max-w-md mx-auto">
                Connect your Casper Wallet to act as the invoice issuer. You&apos;ll receive
                the escrowed funds when the demo completes.
              </p>
              {walletError && (
                <div className="flex items-center gap-2 text-red-600 text-sm mb-4 justify-center">
                  <AlertCircle className="w-4 h-4" />
                  {walletError}
                </div>
              )}
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--casper-red)] text-white rounded-lg font-medium hover:bg-[var(--casper-red-dark)] transition-colors disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5" />
                    Connect Wallet
                  </>
                )}
              </button>
              <p className="text-xs text-[var(--muted)] mt-4">
                Don&apos;t have Casper Wallet?{' '}
                <a
                  href="https://www.casperwallet.io/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--casper-red)] hover:underline"
                >
                  Download here
                </a>
              </p>
            </div>
          )}

          {/* Step 2: Create Invoice */}
          {currentStep === 'create' && (
            <form onSubmit={handleCreateInvoice} className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[var(--primary-light)] rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[var(--casper-red)]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--casper-dark)]">
                    Create Invoice
                  </h2>
                  <p className="text-sm text-[var(--muted)]">
                    Connected as: {account?.publicKey.slice(0, 8)}...{account?.publicKey.slice(-6)}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--casper-dark)] mb-1.5">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Consulting services"
                    value={invoiceData.description}
                    onChange={(e) => setInvoiceData({ ...invoiceData, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--casper-red)] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--casper-dark)] mb-1.5">
                    Amount (CSPR)
                  </label>
                  <input
                    type="number"
                    min="2.5"
                    max="100"
                    step="0.5"
                    value={invoiceData.amount}
                    onChange={(e) => setInvoiceData({ ...invoiceData, amount: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--casper-red)] focus:border-transparent"
                  />
                  <p className="text-xs text-[var(--muted)] mt-1">
                    Minimum 2.5 CSPR (Casper network requirement)
                  </p>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm mb-4">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="bg-[var(--background-secondary)] rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-[var(--casper-dark)] mb-2">
                  What happens next:
                </h3>
                <ol className="text-sm text-[var(--muted)] space-y-1">
                  <li>1. Escrow contract deployed with your invoice</li>
                  <li>2. Demo payer automatically accepts the terms</li>
                  <li>3. Demo payer funds the escrow</li>
                  <li>4. Demo payer releases funds to you (issuer)</li>
                </ol>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--casper-red)] text-white rounded-lg font-medium hover:bg-[var(--casper-red-dark)] transition-colors disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Create & Run Demo
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 3: Processing */}
          {currentStep === 'processing' && (
            <div className="p-8">
              <div className="text-center mb-8">
                <Loader2 className="w-12 h-12 text-[var(--casper-red)] animate-spin mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-[var(--casper-dark)] mb-2">
                  Processing Escrow
                </h2>
                <p className="text-[var(--muted)]">
                  Executing transactions on Casper testnet...
                </p>
              </div>

              <div className="space-y-3">
                {['Deploy Contract', 'Accept Terms', 'Fund Escrow', 'Release Funds'].map((step, i) => (
                  <div
                    key={step}
                    className="flex items-center gap-3 p-3 bg-[var(--background-secondary)] rounded-lg"
                  >
                    <Loader2 className="w-5 h-5 text-[var(--casper-red)] animate-spin" />
                    <span className="text-[var(--casper-dark)]">{step}</span>
                    <span className="text-xs text-[var(--muted)] ml-auto">
                      Step {i + 1}/4
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {currentStep === 'complete' && (
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-xl font-semibold text-[var(--casper-dark)] mb-2">
                  Escrow Complete!
                </h2>
                <p className="text-[var(--muted)]">
                  All transactions have been recorded on Casper blockchain.
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {transactions.map((tx, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 bg-[var(--background-secondary)] rounded-lg"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--casper-dark)]">{tx.step}</p>
                      <p className="text-xs text-[var(--muted)] truncate">
                        {tx.deployHash}
                      </p>
                    </div>
                    <a
                      href={`https://testnet.cspr.live/deploy/${tx.deployHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-[var(--casper-red)] hover:underline flex-shrink-0"
                    >
                      View
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setCurrentStep('create');
                    setTransactions([]);
                    setInvoiceData({ description: '', amount: '10' });
                  }}
                  className="flex-1 px-6 py-3 border border-[var(--border)] text-[var(--casper-dark)] rounded-lg font-medium hover:bg-[var(--background-secondary)] transition-colors"
                >
                  Create Another
                </button>
                <a
                  href="https://testnet.cspr.live"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[var(--casper-dark)] text-white rounded-lg font-medium hover:bg-[var(--casper-dark-light)] transition-colors"
                >
                  Explorer
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 p-6 bg-[var(--casper-dark)] rounded-xl text-white">
          <h3 className="font-semibold mb-2">About this Demo</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            This demo uses a pre-funded testnet wallet to automatically complete the payer
            side of the escrow. In a real integration, the payer would connect their own
            wallet and manually approve each step. All transactions are real and can be
            verified on the Casper testnet explorer.
          </p>
        </div>
      </div>
    </div>
  );
}

function StepIndicator({
  step,
  label,
  active,
  completed,
}: {
  step: number;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
          completed
            ? 'bg-emerald-500 text-white'
            : active
            ? 'bg-[var(--casper-red)] text-white'
            : 'bg-[var(--background-secondary)] text-[var(--muted)] border border-[var(--border)]'
        }`}
      >
        {completed ? <CheckCircle className="w-4 h-4" /> : step}
      </div>
      <span
        className={`text-xs ${
          active || completed ? 'text-[var(--casper-dark)] font-medium' : 'text-[var(--muted)]'
        }`}
      >
        {label}
      </span>
    </div>
  );
}
