'use client';

import { useState, useCallback, useEffect } from 'react';
import { api, ApiError, type EscrowListResponse } from '@/lib/api';
import { useCasper } from '@/lib/casper';
import type { Invoice, InvoiceStatus } from '@/types';

interface UseInvoicesReturn {
  invoices: Invoice[];
  isLoading: boolean;
  error: string | null;
  fetchInvoices: () => Promise<void>;
  getInvoice: (id: string) => Promise<Invoice | null>;
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
    'draft': 'draft',
    'accepted': 'accepted',
    'funded': 'funded',
    'released': 'completed',
    'cancelled': 'cancelled',
    'disputed': 'disputed',
  };
  return stateMap[state.toLowerCase()] || 'pending';
}

// Convert API escrow to Invoice format
function escrowToInvoice(escrow: EscrowListResponse): Invoice {
  return {
    id: escrow.contractAddress,
    invoiceNumber: escrow.invoice.id,
    description: escrow.invoice.description,
    amount: escrow.invoice.amount,
    currency: 'USD',
    status: mapStateToStatus(escrow.state),
    issuer: {
      id: escrow.invoice.issuerAddress,
      name: escrow.invoice.issuerAddress.slice(0, 16) + '...',
      email: 'issuer@demo.com',
    },
    payer: {
      id: escrow.invoice.payerAddress,
      name: escrow.invoice.payerAddress.slice(0, 16) + '...',
      email: escrow.invoice.payerAddress,
    },
    createdAt: escrow.invoice.createdAt,
    dueDate: escrow.invoice.dueDate,
    notes: escrow.disputeReason,
  };
}

export function useInvoices(): UseInvoicesReturn {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { account, isConnected } = useCasper();

  // Fetch all invoices from API
  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const escrows = await api.escrow.list();
      const invoiceList = escrows.map(escrowToInvoice);
      setInvoices(invoiceList);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to fetch invoices';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get single invoice from API
  const getInvoice = useCallback(async (id: string): Promise<Invoice | null> => {
    try {
      const escrow = await api.escrow.get(id);
      return {
        id: escrow.contractAddress,
        invoiceNumber: escrow.invoice.id,
        description: escrow.invoice.description,
        amount: escrow.invoice.amount,
        currency: 'USD',
        status: mapStateToStatus(escrow.state),
        issuer: {
          id: escrow.invoice.issuerAddress,
          name: escrow.invoice.issuerAddress.slice(0, 16) + '...',
          email: 'issuer@demo.com',
        },
        payer: {
          id: escrow.invoice.payerAddress,
          name: escrow.invoice.payerAddress.slice(0, 16) + '...',
          email: escrow.invoice.payerAddress,
        },
        createdAt: escrow.invoice.createdAt,
      };
    } catch (err) {
      return null;
    }
  }, []);

  // Load invoices on mount
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

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

      // Refresh list to get data from API
      await fetchInvoices();
      return newInvoice;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to create invoice';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, fetchInvoices]);

  const acceptInvoice = useCallback(async (invoiceId: string): Promise<boolean> => {
    if (!isConnected || !account) {
      setError('Please connect your wallet first');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.escrow.accept(invoiceId, account.publicKey);
      await fetchInvoices();
      return true;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to accept invoice';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, fetchInvoices]);

  const fundInvoice = useCallback(async (invoiceId: string, amount: number): Promise<boolean> => {
    if (!isConnected || !account) {
      setError('Please connect your wallet first');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.escrow.fund(invoiceId, amount, account.publicKey);
      await fetchInvoices();
      return true;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to fund invoice';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, fetchInvoices]);

  const releaseInvoice = useCallback(async (invoiceId: string): Promise<boolean> => {
    if (!isConnected || !account) {
      setError('Please connect your wallet first');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.escrow.release(invoiceId, account.publicKey);
      await fetchInvoices();
      return true;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to release funds';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, fetchInvoices]);

  const cancelInvoice = useCallback(async (invoiceId: string): Promise<boolean> => {
    if (!isConnected || !account) {
      setError('Please connect your wallet first');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.escrow.cancel(invoiceId, account.publicKey);
      await fetchInvoices();
      return true;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to cancel invoice';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, fetchInvoices]);

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
    fetchInvoices,
    getInvoice,
    createInvoice,
    acceptInvoice,
    fundInvoice,
    releaseInvoice,
    cancelInvoice,
    refreshInvoice,
  };
}
