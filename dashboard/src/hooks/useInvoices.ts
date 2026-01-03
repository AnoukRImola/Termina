'use client';

import { useState, useCallback } from 'react';
import { api, ApiError } from '@/lib/api';
import { useCasper } from '@/lib/casper';
import type { Invoice, InvoiceStatus } from '@/types';

interface UseInvoicesReturn {
  invoices: Invoice[];
  isLoading: boolean;
  error: string | null;
  createInvoice: (params: CreateInvoiceParams) => Promise<Invoice | null>;
  acceptInvoice: (invoiceId: string) => Promise<boolean>;
  fundInvoice: (invoiceId: string, amount: number) => Promise<boolean>;
  releaseInvoice: (invoiceId: string) => Promise<boolean>;
  cancelInvoice: (invoiceId: string) => Promise<boolean>;
  refreshInvoice: (invoiceId: string) => Promise<void>;
}

interface CreateInvoiceParams {
  description: string;
  amount: number;
  payerEmail: string;
  payerName: string;
  dueDate?: string;
  notes?: string;
}

// Map API state to UI status
function mapStateToStatus(state: string): InvoiceStatus {
  const stateMap: Record<string, InvoiceStatus> = {
    'Draft': 'draft',
    'Accepted': 'accepted',
    'Funded': 'funded',
    'Released': 'completed',
    'Cancelled': 'cancelled',
    'Disputed': 'disputed',
  };
  return stateMap[state] || 'pending';
}

export function useInvoices(): UseInvoicesReturn {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { account, isConnected, signAndSendDeploy } = useCasper();

  const createInvoice = useCallback(async (params: CreateInvoiceParams): Promise<Invoice | null> => {
    if (!isConnected || !account) {
      setError('Please connect your wallet first');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Generate invoice ID
      const invoiceId = `INV-${Date.now().toString(36).toUpperCase()}`;

      // Create escrow via API (demo mode)
      const result = await api.escrow.create(
        {
          id: invoiceId,
          description: params.description,
          amount: params.amount,
          payerAddress: params.payerEmail, // In production, this would be a public key
          dueDate: params.dueDate,
        },
        account.publicKey
      );

      // Create local invoice object
      const newInvoice: Invoice = {
        id: result.contractAddress || invoiceId,
        invoiceNumber: invoiceId,
        description: params.description,
        amount: params.amount,
        currency: 'USD',
        status: 'draft',
        issuer: {
          id: account.publicKey,
          name: account.name || 'Your Company',
          email: 'billing@yourcompany.com',
        },
        payer: {
          id: params.payerEmail,
          name: params.payerName,
          email: params.payerEmail,
        },
        createdAt: new Date().toISOString(),
        dueDate: params.dueDate,
        notes: params.notes,
      };

      setInvoices(prev => [newInvoice, ...prev]);
      return newInvoice;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to create invoice';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account]);

  const acceptInvoice = useCallback(async (invoiceId: string): Promise<boolean> => {
    if (!isConnected || !account) {
      setError('Please connect your wallet first');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.escrow.accept(invoiceId, account.publicKey);

      // Update local state
      setInvoices(prev =>
        prev.map(inv =>
          inv.id === invoiceId ? { ...inv, status: 'accepted' as InvoiceStatus } : inv
        )
      );

      return true;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to accept invoice';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account]);

  const fundInvoice = useCallback(async (invoiceId: string, amount: number): Promise<boolean> => {
    if (!isConnected || !account) {
      setError('Please connect your wallet first');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.escrow.fund(invoiceId, amount, account.publicKey);

      // Update local state
      setInvoices(prev =>
        prev.map(inv =>
          inv.id === invoiceId ? { ...inv, status: 'funded' as InvoiceStatus } : inv
        )
      );

      return true;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to fund invoice';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account]);

  const releaseInvoice = useCallback(async (invoiceId: string): Promise<boolean> => {
    if (!isConnected || !account) {
      setError('Please connect your wallet first');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.escrow.release(invoiceId, account.publicKey);

      // Update local state
      setInvoices(prev =>
        prev.map(inv =>
          inv.id === invoiceId
            ? { ...inv, status: 'completed' as InvoiceStatus, paidAt: new Date().toISOString() }
            : inv
        )
      );

      return true;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to release funds';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account]);

  const cancelInvoice = useCallback(async (invoiceId: string): Promise<boolean> => {
    if (!isConnected || !account) {
      setError('Please connect your wallet first');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.escrow.cancel(invoiceId, account.publicKey);

      // Update local state
      setInvoices(prev =>
        prev.map(inv =>
          inv.id === invoiceId ? { ...inv, status: 'cancelled' as InvoiceStatus } : inv
        )
      );

      return true;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to cancel invoice';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account]);

  const refreshInvoice = useCallback(async (invoiceId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await api.escrow.get(invoiceId);

      // Update local state with fresh data
      setInvoices(prev =>
        prev.map(inv =>
          inv.id === invoiceId
            ? {
                ...inv,
                status: mapStateToStatus(data.state),
                amount: data.invoice.amount,
              }
            : inv
        )
      );
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to refresh invoice';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    invoices,
    isLoading,
    error,
    createInvoice,
    acceptInvoice,
    fundInvoice,
    releaseInvoice,
    cancelInvoice,
    refreshInvoice,
  };
}
