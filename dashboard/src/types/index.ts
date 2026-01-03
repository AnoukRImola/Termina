export type InvoiceStatus =
  | 'draft'
  | 'pending'
  | 'accepted'
  | 'funded'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  description: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  issuer: {
    id: string;
    name: string;
    email: string;
  };
  payer: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  dueDate?: string;
  paidAt?: string;
  notes?: string;
}

export interface DashboardStats {
  totalInvoices: number;
  pendingAmount: number;
  completedAmount: number;
  overdueCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  company?: string;
  avatar?: string;
}
