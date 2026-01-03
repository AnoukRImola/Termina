'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { InvoiceTable } from '@/components/invoices/InvoiceTable';
import { InvoiceCard } from '@/components/invoices/InvoiceCard';
import { mockInvoices } from '@/lib/mock-data';
import { Plus, LayoutGrid, List, Filter } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { InvoiceStatus } from '@/types';

const statusFilters: { value: InvoiceStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Invoices' },
  { value: 'draft', label: 'Drafts' },
  { value: 'pending', label: 'Pending' },
  { value: 'funded', label: 'Payment Secured' },
  { value: 'completed', label: 'Completed' },
  { value: 'disputed', label: 'Under Review' },
];

export default function InvoicesPage() {
  const [view, setView] = useState<'grid' | 'table'>('table');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');

  const filteredInvoices = statusFilter === 'all'
    ? mockInvoices
    : mockInvoices.filter((inv) => inv.status === statusFilter);

  return (
    <DashboardLayout>
      <Header
        title="Invoices"
        description="Manage and track all your invoices"
        actions={
          <Link href="/invoices/new">
            <Button>
              <Plus className="w-4 h-4" />
              New Invoice
            </Button>
          </Link>
        }
      />

      <div className="p-6">
        {/* Filters and View Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Status Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors',
                  statusFilter === filter.value
                    ? 'bg-blue-800 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
              <button
                onClick={() => setView('table')}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  view === 'table' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'
                )}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('grid')}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  view === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Invoice List */}
        {filteredInvoices.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Filter className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No invoices found</h3>
            <p className="text-slate-500 mb-6">
              No invoices match your current filter. Try a different filter or create a new invoice.
            </p>
            <Link href="/invoices/new">
              <Button>
                <Plus className="w-4 h-4" />
                Create Invoice
              </Button>
            </Link>
          </div>
        ) : view === 'table' ? (
          <InvoiceTable invoices={filteredInvoices} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInvoices.map((invoice) => (
              <InvoiceCard key={invoice.id} invoice={invoice} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
