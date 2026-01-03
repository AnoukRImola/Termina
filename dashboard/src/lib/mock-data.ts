import type { Invoice, DashboardStats } from '@/types';

export const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    description: 'Q4 Consulting Services',
    amount: 15000,
    currency: 'USD',
    status: 'funded',
    issuer: {
      id: 'issuer-1',
      name: 'Acme Corp',
      email: 'billing@acme.com',
    },
    payer: {
      id: 'payer-1',
      name: 'TechStart Inc',
      email: 'payments@techstart.io',
    },
    createdAt: '2024-01-15T10:00:00Z',
    dueDate: '2024-02-15T10:00:00Z',
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    description: 'Software Development - Phase 1',
    amount: 45000,
    currency: 'USD',
    status: 'pending',
    issuer: {
      id: 'issuer-1',
      name: 'Acme Corp',
      email: 'billing@acme.com',
    },
    payer: {
      id: 'payer-2',
      name: 'Global Solutions Ltd',
      email: 'ap@globalsolutions.com',
    },
    createdAt: '2024-01-20T14:30:00Z',
    dueDate: '2024-02-20T14:30:00Z',
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    description: 'Annual Maintenance Contract',
    amount: 8500,
    currency: 'USD',
    status: 'completed',
    issuer: {
      id: 'issuer-1',
      name: 'Acme Corp',
      email: 'billing@acme.com',
    },
    payer: {
      id: 'payer-3',
      name: 'Innovate Partners',
      email: 'finance@innovatepartners.co',
    },
    createdAt: '2024-01-10T09:00:00Z',
    paidAt: '2024-01-12T16:45:00Z',
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-004',
    description: 'UI/UX Design Services',
    amount: 12000,
    currency: 'USD',
    status: 'accepted',
    issuer: {
      id: 'issuer-1',
      name: 'Acme Corp',
      email: 'billing@acme.com',
    },
    payer: {
      id: 'payer-4',
      name: 'StartupXYZ',
      email: 'cfo@startupxyz.com',
    },
    createdAt: '2024-01-22T11:15:00Z',
    dueDate: '2024-02-22T11:15:00Z',
  },
  {
    id: '5',
    invoiceNumber: 'INV-2024-005',
    description: 'Cloud Infrastructure Setup',
    amount: 28000,
    currency: 'USD',
    status: 'draft',
    issuer: {
      id: 'issuer-1',
      name: 'Acme Corp',
      email: 'billing@acme.com',
    },
    payer: {
      id: 'payer-5',
      name: 'Enterprise Co',
      email: 'accounts@enterprise.com',
    },
    createdAt: '2024-01-25T08:00:00Z',
  },
  {
    id: '6',
    invoiceNumber: 'INV-2024-006',
    description: 'Security Audit Services',
    amount: 18500,
    currency: 'USD',
    status: 'disputed',
    issuer: {
      id: 'issuer-1',
      name: 'Acme Corp',
      email: 'billing@acme.com',
    },
    payer: {
      id: 'payer-6',
      name: 'SecureNet LLC',
      email: 'billing@securenet.com',
    },
    createdAt: '2024-01-05T13:00:00Z',
    dueDate: '2024-02-05T13:00:00Z',
    notes: 'Client requested scope clarification',
  },
];

export const mockStats: DashboardStats = {
  totalInvoices: 24,
  pendingAmount: 85000,
  completedAmount: 156000,
  overdueCount: 2,
};

export function getInvoiceById(id: string): Invoice | undefined {
  return mockInvoices.find((inv) => inv.id === id);
}
