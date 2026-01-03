'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { mockInvoices } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import {
  Plus,
  Search,
  Building2,
  Mail,
  FileText,
  DollarSign,
  MoreHorizontal,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';

interface Client {
  id: string;
  name: string;
  email: string;
  totalInvoices: number;
  totalAmount: number;
  pendingAmount: number;
}

function getClientsFromInvoices(): Client[] {
  const clientMap = new Map<string, Client>();

  mockInvoices.forEach((invoice) => {
    const existing = clientMap.get(invoice.payer.id);
    if (existing) {
      existing.totalInvoices += 1;
      existing.totalAmount += invoice.amount;
      if (invoice.status !== 'completed') {
        existing.pendingAmount += invoice.amount;
      }
    } else {
      clientMap.set(invoice.payer.id, {
        id: invoice.payer.id,
        name: invoice.payer.name,
        email: invoice.payer.email,
        totalInvoices: 1,
        totalAmount: invoice.amount,
        pendingAmount: invoice.status !== 'completed' ? invoice.amount : 0,
      });
    }
  });

  return Array.from(clientMap.values());
}

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const clients = getClientsFromInvoices();

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <Header
        title="Clients"
        description="Manage your client relationships"
        actions={
          <Button>
            <Plus className="w-4 h-4" />
            Add Client
          </Button>
        }
      />

      <div className="p-6">
        {/* Search */}
        <div className="mb-6 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Clients Grid */}
        {filteredClients.length === 0 ? (
          <Card padding="lg" className="text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No clients found</h3>
            <p className="text-slate-500 mb-6">
              {searchQuery
                ? 'No clients match your search. Try a different term.'
                : 'Start by adding your first client.'}
            </p>
            <Button>
              <Plus className="w-4 h-4" />
              Add Client
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <Card key={client.id} className="group hover:border-blue-200 hover:shadow-md transition-all duration-200">
                <Card.Content className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                        <span className="text-lg font-bold text-white">
                          {client.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{client.name}</h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {client.email}
                        </p>
                      </div>
                    </div>
                    <button className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-100">
                    <div>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mb-1">
                        <FileText className="w-3.5 h-3.5" />
                        Invoices
                      </p>
                      <p className="text-lg font-semibold text-slate-900">{client.totalInvoices}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mb-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        Total
                      </p>
                      <p className="text-lg font-semibold text-slate-900">
                        {formatCurrency(client.totalAmount)}
                      </p>
                    </div>
                  </div>

                  {client.pendingAmount > 0 && (
                    <div className="py-3 px-4 bg-amber-50 rounded-lg border border-amber-100">
                      <p className="text-sm text-amber-800">
                        <span className="font-medium">{formatCurrency(client.pendingAmount)}</span>
                        {' '}pending
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <Link
                      href={`/invoices?client=${client.id}`}
                      className="text-sm font-medium text-blue-800 hover:text-blue-900 flex items-center gap-1"
                    >
                      View Invoices
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link href="/invoices/new">
                      <Button size="sm" variant="outline">
                        <Plus className="w-3.5 h-3.5" />
                        New Invoice
                      </Button>
                    </Link>
                  </div>
                </Card.Content>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
