'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getInvoiceById } from '@/lib/mock-data';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  Send,
  Download,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  Mail,
  Calendar,
  DollarSign,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import type { InvoiceStatus } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

const statusSteps: { status: InvoiceStatus; label: string; description: string }[] = [
  { status: 'draft', label: 'Draft', description: 'Invoice created' },
  { status: 'pending', label: 'Sent', description: 'Awaiting client review' },
  { status: 'accepted', label: 'Accepted', description: 'Client approved' },
  { status: 'funded', label: 'Payment Secured', description: 'Funds held in escrow' },
  { status: 'completed', label: 'Completed', description: 'Payment released' },
];

const statusOrder: Record<InvoiceStatus, number> = {
  draft: 0,
  pending: 1,
  accepted: 2,
  funded: 3,
  completed: 4,
  cancelled: -1,
  disputed: -1,
};

function getStatusIcon(status: InvoiceStatus, currentStatus: InvoiceStatus) {
  const currentOrder = statusOrder[currentStatus];
  const stepOrder = statusOrder[status];

  if (currentStatus === 'cancelled' || currentStatus === 'disputed') {
    return <AlertCircle className="w-5 h-5 text-slate-400" />;
  }

  if (stepOrder < currentOrder) {
    return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
  } else if (stepOrder === currentOrder) {
    return <Clock className="w-5 h-5 text-blue-500" />;
  } else {
    return <div className="w-5 h-5 rounded-full border-2 border-slate-300" />;
  }
}

export default function InvoiceDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const invoice = getInvoiceById(id);

  if (!invoice) {
    notFound();
  }

  const currentOrder = statusOrder[invoice.status];

  return (
    <DashboardLayout>
      <Header
        title={invoice.invoiceNumber}
        description={invoice.description}
        actions={
          <div className="flex items-center gap-3">
            <Link href="/invoices">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <Button variant="outline">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            {invoice.status === 'draft' && (
              <Button>
                <Send className="w-4 h-4" />
                Send Invoice
              </Button>
            )}
            {invoice.status === 'pending' && (
              <Button>
                <RefreshCw className="w-4 h-4" />
                Send Reminder
              </Button>
            )}
          </div>
        }
      />

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Header */}
            <Card>
              <Card.Content className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-slate-900">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </h2>
                      <StatusBadge status={invoice.status} />
                    </div>
                    <p className="text-slate-500">{invoice.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </Card.Content>
            </Card>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* From */}
              <Card>
                <Card.Header>
                  <Card.Title className="text-sm font-medium text-slate-500">From</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-800" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{invoice.issuer.name}</p>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <Mail className="w-3.5 h-3.5" />
                        {invoice.issuer.email}
                      </p>
                    </div>
                  </div>
                </Card.Content>
              </Card>

              {/* To */}
              <Card>
                <Card.Header>
                  <Card.Title className="text-sm font-medium text-slate-500">To</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{invoice.payer.name}</p>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <Mail className="w-3.5 h-3.5" />
                        {invoice.payer.email}
                      </p>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </div>

            {/* Dates & Amount */}
            <Card>
              <Card.Content className="pt-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mb-1">
                      <FileText className="w-3.5 h-3.5" />
                      Invoice Number
                    </p>
                    <p className="font-semibold text-slate-900">{invoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Issue Date
                    </p>
                    <p className="font-semibold text-slate-900">{formatDate(invoice.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Due Date
                    </p>
                    <p className="font-semibold text-slate-900">
                      {invoice.dueDate ? formatDate(invoice.dueDate) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mb-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      Amount
                    </p>
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card>

            {/* Notes */}
            {invoice.notes && (
              <Card>
                <Card.Header>
                  <Card.Title>Notes</Card.Title>
                </Card.Header>
                <Card.Content>
                  <p className="text-slate-600">{invoice.notes}</p>
                </Card.Content>
              </Card>
            )}
          </div>

          {/* Sidebar - Status Timeline */}
          <div className="space-y-6">
            <Card>
              <Card.Header>
                <Card.Title>Invoice Progress</Card.Title>
                <Card.Description>Track the status of your invoice</Card.Description>
              </Card.Header>
              <Card.Content>
                {invoice.status === 'cancelled' || invoice.status === 'disputed' ? (
                  <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">
                        {invoice.status === 'cancelled' ? 'Invoice Cancelled' : 'Under Review'}
                      </p>
                      <p className="text-sm text-red-600 mt-1">
                        {invoice.status === 'cancelled'
                          ? 'This invoice has been cancelled and is no longer active.'
                          : 'This invoice is currently under review. Please contact support for more information.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    {statusSteps.map((step, index) => {
                      const isCompleted = statusOrder[step.status] < currentOrder;
                      const isCurrent = statusOrder[step.status] === currentOrder;

                      return (
                        <div key={step.status} className="flex gap-4 pb-6 last:pb-0">
                          {/* Line */}
                          {index < statusSteps.length - 1 && (
                            <div
                              className={`absolute left-[9px] top-6 w-0.5 h-[calc(100%-24px)] ${
                                isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                              }`}
                              style={{
                                top: `${index * 64 + 24}px`,
                                height: '40px',
                              }}
                            />
                          )}

                          {/* Icon */}
                          <div className="relative z-10 flex-shrink-0">
                            {getStatusIcon(step.status, invoice.status)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-medium ${
                                isCurrent
                                  ? 'text-blue-800'
                                  : isCompleted
                                  ? 'text-slate-900'
                                  : 'text-slate-400'
                              }`}
                            >
                              {step.label}
                            </p>
                            <p className="text-sm text-slate-500">{step.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card.Content>
            </Card>

            {/* Quick Actions */}
            <Card>
              <Card.Header>
                <Card.Title>Actions</Card.Title>
              </Card.Header>
              <Card.Content className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Send className="w-4 h-4" />
                  Send Copy
                </Button>
                {invoice.status === 'pending' && (
                  <Button variant="outline" className="w-full justify-start">
                    <RefreshCw className="w-4 h-4" />
                    Send Reminder
                  </Button>
                )}
                {invoice.status === 'draft' && (
                  <Button variant="danger" className="w-full justify-start">
                    Delete Invoice
                  </Button>
                )}
              </Card.Content>
            </Card>

            {/* Activity */}
            <Card>
              <Card.Header>
                <Card.Title>Recent Activity</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-blue-800" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-900">Invoice created</p>
                      <p className="text-xs text-slate-500">{formatDate(invoice.createdAt)}</p>
                    </div>
                  </div>
                  {invoice.status !== 'draft' && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Send className="w-4 h-4 text-emerald-800" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-900">Invoice sent to client</p>
                        <p className="text-xs text-slate-500">{formatDate(invoice.createdAt)}</p>
                      </div>
                    </div>
                  )}
                  {invoice.paidAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-900">Payment completed</p>
                        <p className="text-xs text-slate-500">{formatDate(invoice.paidAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
