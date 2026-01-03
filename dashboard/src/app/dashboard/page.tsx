import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { StatsCard } from '@/components/invoices/StatsCard';
import { InvoiceTable } from '@/components/invoices/InvoiceTable';
import { mockInvoices } from '@/lib/mock-data';
import { FileText, DollarSign, Clock, AlertTriangle, Plus } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const recentInvoices = mockInvoices.slice(0, 5);

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
            value="24"
            change={{ value: '12%', positive: true }}
            icon={FileText}
            iconColor="bg-blue-100 text-blue-800"
          />
          <StatsCard
            title="Pending Amount"
            value="$85,000"
            change={{ value: '8%', positive: true }}
            icon={Clock}
            iconColor="bg-amber-100 text-amber-800"
          />
          <StatsCard
            title="Completed This Month"
            value="$156,000"
            change={{ value: '23%', positive: true }}
            icon={DollarSign}
            iconColor="bg-emerald-100 text-emerald-800"
          />
          <StatsCard
            title="Requires Attention"
            value="2"
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
          <InvoiceTable invoices={recentInvoices} />
        </div>
      </div>
    </DashboardLayout>
  );
}
