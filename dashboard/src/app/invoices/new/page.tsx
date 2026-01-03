'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { ArrowLeft, Send, Save, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

const clients = [
  { value: 'techstart', label: 'TechStart Inc' },
  { value: 'global', label: 'Global Solutions Ltd' },
  { value: 'innovate', label: 'Innovate Partners' },
  { value: 'startup', label: 'StartupXYZ' },
  { value: 'enterprise', label: 'Enterprise Co' },
];

const currencies = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
];

const paymentTerms = [
  { value: '15', label: 'Net 15' },
  { value: '30', label: 'Net 30' },
  { value: '45', label: 'Net 45' },
  { value: '60', label: 'Net 60' },
  { value: '90', label: 'Net 90' },
];

export default function NewInvoicePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    client: '',
    currency: 'USD',
    paymentTerms: '30',
    notes: '',
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0 },
  ]);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(
      lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: formData.currency,
    }).format(amount);
  };

  const handleSubmit = async (asDraft: boolean) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push('/invoices');
  };

  return (
    <DashboardLayout>
      <Header
        title="Create Invoice"
        description="Create a new invoice for your client"
        actions={
          <Link href="/invoices">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4" />
              Back to Invoices
            </Button>
          </Link>
        }
      />

      <div className="p-6 max-w-4xl">
        <div className="space-y-6">
          {/* Client & Basic Info */}
          <Card>
            <Card.Header>
              <Card.Title>Invoice Details</Card.Title>
              <Card.Description>
                Select the client and configure payment terms
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Client"
                  options={clients}
                  value={formData.client}
                  onChange={(e) =>
                    setFormData({ ...formData, client: e.target.value })
                  }
                  placeholder="Select a client"
                  required
                />
                <Select
                  label="Currency"
                  options={currencies}
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                />
                <Select
                  label="Payment Terms"
                  options={paymentTerms}
                  value={formData.paymentTerms}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentTerms: e.target.value })
                  }
                />
                <Input
                  label="Due Date"
                  type="date"
                  value=""
                  onChange={() => {}}
                  hint="Auto-calculated based on payment terms"
                  disabled
                />
              </div>
            </Card.Content>
          </Card>

          {/* Line Items */}
          <Card>
            <Card.Header>
              <Card.Title>Line Items</Card.Title>
              <Card.Description>
                Add the services or products for this invoice
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                {/* Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 text-sm font-medium text-slate-500 pb-2 border-b border-slate-200">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-right">Quantity</div>
                  <div className="col-span-2 text-right">Unit Price</div>
                  <div className="col-span-2 text-right">Amount</div>
                </div>

                {/* Items */}
                {lineItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start py-4 border-b border-slate-100 last:border-0"
                  >
                    <div className="md:col-span-6">
                      <label className="md:hidden text-sm font-medium text-slate-700 mb-1 block">
                        Description
                      </label>
                      <Input
                        placeholder="Service or product description"
                        value={item.description}
                        onChange={(e) =>
                          updateLineItem(item.id, 'description', e.target.value)
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="md:hidden text-sm font-medium text-slate-700 mb-1 block">
                        Quantity
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)
                        }
                        className="text-right"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="md:hidden text-sm font-medium text-slate-700 mb-1 block">
                        Unit Price
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)
                        }
                        className="text-right"
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-2">
                      <span className="text-sm font-medium text-slate-900 md:flex-1 md:text-right">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </span>
                      <button
                        onClick={() => removeLineItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                        disabled={lineItems.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <Button variant="outline" onClick={addLineItem} className="w-full md:w-auto">
                  <Plus className="w-4 h-4" />
                  Add Line Item
                </Button>
              </div>
            </Card.Content>
          </Card>

          {/* Summary & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <Card.Header>
                <Card.Title>Notes</Card.Title>
                <Card.Description>
                  Additional information for your client
                </Card.Description>
              </Card.Header>
              <Card.Content>
                <Textarea
                  placeholder="Enter any notes or payment instructions..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={4}
                />
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>Summary</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="text-slate-900 font-medium">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tax (0%)</span>
                    <span className="text-slate-900 font-medium">
                      {formatCurrency(0)}
                    </span>
                  </div>
                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-base font-semibold text-slate-900">
                        Total
                      </span>
                      <span className="text-xl font-bold text-slate-900">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4" />
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting || !formData.client || subtotal === 0}
            >
              <Send className="w-4 h-4" />
              Send Invoice
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
