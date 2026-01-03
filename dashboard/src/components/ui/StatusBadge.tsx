import { cn } from '@/lib/utils';
import type { InvoiceStatus } from '@/types';

interface StatusBadgeProps {
  status: InvoiceStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<InvoiceStatus, { label: string; className: string }> = {
  draft: {
    label: 'Draft',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  pending: {
    label: 'Pending Approval',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  accepted: {
    label: 'Accepted',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  funded: {
    label: 'Payment Secured',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  completed: {
    label: 'Completed',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-slate-50 text-slate-500 border-slate-200',
  },
  disputed: {
    label: 'Under Review',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
