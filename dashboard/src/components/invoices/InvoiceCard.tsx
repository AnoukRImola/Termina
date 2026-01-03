'use client';

import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Invoice } from '@/types';
import { ArrowRight, Building2, Calendar } from 'lucide-react';
import Link from 'next/link';

interface InvoiceCardProps {
  invoice: Invoice;
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  return (
    <Link href={`/invoices/${invoice.id}`}>
      <Card padding="md" className="group hover:border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{invoice.invoiceNumber}</p>
            <h3 className="text-lg font-semibold text-slate-900 mt-0.5 group-hover:text-blue-800 transition-colors">
              {invoice.description}
            </h3>
          </div>
          <StatusBadge status={invoice.status} />
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4" />
            <span>{invoice.payer.name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(invoice.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {formatCurrency(invoice.amount, invoice.currency)}
            </p>
          </div>
          <div className="flex items-center gap-1 text-sm font-medium text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity">
            View Details
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
