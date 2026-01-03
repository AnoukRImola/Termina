'use client';

import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Invoice } from '@/types';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

interface InvoiceTableProps {
  invoices: Invoice[];
}

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
              Invoice
            </th>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
              Client
            </th>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
              Status
            </th>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
              Date
            </th>
            <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
              Amount
            </th>
            <th className="w-12 px-6 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {invoices.map((invoice) => (
            <tr
              key={invoice.id}
              className="hover:bg-slate-50 transition-colors"
            >
              <td className="px-6 py-4">
                <Link href={`/invoices/${invoice.id}`} className="block">
                  <p className="text-sm font-medium text-slate-900 hover:text-blue-800">
                    {invoice.invoiceNumber}
                  </p>
                  <p className="text-sm text-slate-500 truncate max-w-[200px]">
                    {invoice.description}
                  </p>
                </Link>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm font-medium text-slate-900">{invoice.payer.name}</p>
                <p className="text-sm text-slate-500">{invoice.payer.email}</p>
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={invoice.status} size="sm" />
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-slate-600">{formatDate(invoice.createdAt)}</p>
                {invoice.dueDate && (
                  <p className="text-xs text-slate-400">Due {formatDate(invoice.dueDate)}</p>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {formatCurrency(invoice.amount, invoice.currency)}
                </p>
              </td>
              <td className="px-6 py-4">
                <button className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
