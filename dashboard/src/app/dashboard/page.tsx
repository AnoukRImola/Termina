'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { StatsCard } from '@/components/invoices/StatsCard';
import { InvoiceTable } from '@/components/invoices/InvoiceTable';
import { useInvoices } from '@/hooks';
import { formatCurrency } from '@/lib/utils';
import { FileText, DollarSign, Clock, AlertTriangle, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { invoices, isLoading } = useInvoices();

  // Calculate stats from real data
  const totalInvoices = invoices.length;
  const pendingAmount = invoices
    .filter(inv => ['draft', 'pending', 'accepted'].includes(inv.status))
    .reduce((sum, inv) => sum + inv.amount, 0);
  const completedAmount = invoices
    .filter(inv => inv.status === 'completed')
    .reduce((sum, inv) => sum + inv.amount, 0);
  const requiresAttention = invoices
    .filter(inv => ['disputed', 'cancelled'].includes(inv.status))
    .length;

  const recentInvoices = invoices.slice(0, 5);

  return (
    <DashboardLayout>
      <Header
        title="Dashboard"
        description="Overview of your invoicing activity"
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
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Invoices"
            value={isLoading ? '-' : totalInvoices.toString()}
            icon={FileText}
            iconColor="bg-blue-100 text-blue-800"
          />
          <StatsCard
            title="Pending Amount"
            value={isLoading ? '-' : formatCurrency(pendingAmount, 'USD')}
            icon={Clock}
            iconColor="bg-amber-100 text-amber-800"
          />
          <StatsCard
            title="Completed"
            value={isLoading ? '-' : formatCurrency(completedAmount, 'USD')}
            icon={DollarSign}
            iconColor="bg-emerald-100 text-emerald-800"
          />
          <StatsCard
            title="Requires Attention"
            value={isLoading ? '-' : requiresAttention.toString()}
            icon={AlertTriangle}
            iconColor="bg-red-100 text-red-800"
          />
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Recent Invoices</h2>
              <p className="text-sm text-slate-500">Your latest invoicing activity</p>
            </div>
            <Link href="/invoices">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          {isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Loading invoices...</p>
            </div>
          ) : recentInvoices.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-500">No invoices yet. Create your first invoice to get started.</p>
              <Link href="/invoices/new">
                <Button className="mt-4">
                  <Plus className="w-4 h-4" />
                  Create Invoice
                </Button>
              </Link>
            </div>
          ) : (
            <InvoiceTable invoices={recentInvoices} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
