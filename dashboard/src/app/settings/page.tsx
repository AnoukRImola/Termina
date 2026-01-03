'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/lib/utils';
import {
  User,
  Building2,
  CreditCard,
  Bell,
  Shield,
  Save,
} from 'lucide-react';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
];

const timezones = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
];

const currencies = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <DashboardLayout>
      <Header
        title="Settings"
        description="Manage your account and preferences"
      />

      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:w-64 flex-shrink-0">
            <Card padding="sm">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-800'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-6">
            {activeTab === 'profile' && (
              <>
                <Card>
                  <Card.Header>
                    <Card.Title>Personal Information</Card.Title>
                    <Card.Description>
                      Update your personal details and contact information
                    </Card.Description>
                  </Card.Header>
                  <Card.Content>
                    <div className="flex items-center gap-6 mb-6">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">JD</span>
                      </div>
                      <div>
                        <Button variant="outline" size="sm">
                          Change Photo
                        </Button>
                        <p className="text-sm text-slate-500 mt-2">
                          JPG, PNG or GIF. Max size 2MB.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="First Name"
                        defaultValue="John"
                      />
                      <Input
                        label="Last Name"
                        defaultValue="Doe"
                      />
                      <Input
                        label="Email Address"
                        type="email"
                        defaultValue="john@acme.com"
                      />
                      <Input
                        label="Phone Number"
                        type="tel"
                        defaultValue="+1 (555) 123-4567"
                      />
                    </div>
                  </Card.Content>
                </Card>

                <Card>
                  <Card.Header>
                    <Card.Title>Preferences</Card.Title>
                    <Card.Description>
                      Customize your experience
                    </Card.Description>
                  </Card.Header>
                  <Card.Content>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Select
                        label="Timezone"
                        options={timezones}
                        defaultValue="America/New_York"
                      />
                      <Select
                        label="Default Currency"
                        options={currencies}
                        defaultValue="USD"
                      />
                    </div>
                  </Card.Content>
                </Card>
              </>
            )}

            {activeTab === 'company' && (
              <>
                <Card>
                  <Card.Header>
                    <Card.Title>Company Information</Card.Title>
                    <Card.Description>
                      Details that will appear on your invoices
                    </Card.Description>
                  </Card.Header>
                  <Card.Content>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <Input
                          label="Company Name"
                          defaultValue="Acme Corp"
                        />
                      </div>
                      <Input
                        label="Tax ID / VAT Number"
                        defaultValue="US-123456789"
                      />
                      <Input
                        label="Industry"
                        defaultValue="Technology Services"
                      />
                      <div className="md:col-span-2">
                        <Textarea
                          label="Business Address"
                          defaultValue="123 Business Ave, Suite 100&#10;San Francisco, CA 94102&#10;United States"
                          rows={3}
                        />
                      </div>
                      <Input
                        label="Website"
                        type="url"
                        defaultValue="https://acme.com"
                      />
                      <Input
                        label="Support Email"
                        type="email"
                        defaultValue="support@acme.com"
                      />
                    </div>
                  </Card.Content>
                </Card>

                <Card>
                  <Card.Header>
                    <Card.Title>Invoice Settings</Card.Title>
                    <Card.Description>
                      Default settings for new invoices
                    </Card.Description>
                  </Card.Header>
                  <Card.Content>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Invoice Prefix"
                        defaultValue="INV-"
                      />
                      <Input
                        label="Next Invoice Number"
                        type="number"
                        defaultValue="2024007"
                      />
                      <div className="md:col-span-2">
                        <Textarea
                          label="Default Invoice Notes"
                          placeholder="Enter default notes to appear on all invoices..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              </>
            )}

            {activeTab === 'billing' && (
              <>
                <Card>
                  <Card.Header>
                    <Card.Title>Payment Method</Card.Title>
                    <Card.Description>
                      Manage your payment methods for platform fees
                    </Card.Description>
                  </Card.Header>
                  <Card.Content>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                          <span className="text-xs font-bold text-white">VISA</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">Visa ending in 4242</p>
                          <p className="text-sm text-slate-500">Expires 12/2026</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Update
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" className="mt-4">
                      + Add Payment Method
                    </Button>
                  </Card.Content>
                </Card>

                <Card>
                  <Card.Header>
                    <Card.Title>Billing History</Card.Title>
                    <Card.Description>
                      View your past invoices and receipts
                    </Card.Description>
                  </Card.Header>
                  <Card.Content>
                    <div className="space-y-3">
                      {[
                        { date: 'Dec 1, 2024', amount: '$29.00', status: 'Paid' },
                        { date: 'Nov 1, 2024', amount: '$29.00', status: 'Paid' },
                        { date: 'Oct 1, 2024', amount: '$29.00', status: 'Paid' },
                      ].map((invoice, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                        >
                          <div>
                            <p className="font-medium text-slate-900">{invoice.amount}</p>
                            <p className="text-sm text-slate-500">{invoice.date}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-emerald-600 font-medium">
                              {invoice.status}
                            </span>
                            <Button variant="ghost" size="sm">
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card.Content>
                </Card>
              </>
            )}

            {activeTab === 'notifications' && (
              <Card>
                <Card.Header>
                  <Card.Title>Notification Preferences</Card.Title>
                  <Card.Description>
                    Choose how you want to be notified
                  </Card.Description>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-6">
                    {[
                      {
                        title: 'Invoice Updates',
                        description: 'Get notified when invoice status changes',
                        email: true,
                        push: true,
                      },
                      {
                        title: 'Payment Received',
                        description: 'Get notified when you receive a payment',
                        email: true,
                        push: true,
                      },
                      {
                        title: 'Client Activity',
                        description: 'Get notified when clients view or accept invoices',
                        email: false,
                        push: true,
                      },
                      {
                        title: 'Weekly Summary',
                        description: 'Receive a weekly summary of your invoicing activity',
                        email: true,
                        push: false,
                      },
                    ].map((pref, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between py-4 border-b border-slate-100 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-slate-900">{pref.title}</p>
                          <p className="text-sm text-slate-500">{pref.description}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              defaultChecked={pref.email}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            Email
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              defaultChecked={pref.push}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            Push
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Content>
              </Card>
            )}

            {activeTab === 'security' && (
              <>
                <Card>
                  <Card.Header>
                    <Card.Title>Password</Card.Title>
                    <Card.Description>
                      Update your password regularly to keep your account secure
                    </Card.Description>
                  </Card.Header>
                  <Card.Content>
                    <div className="space-y-4 max-w-md">
                      <Input
                        label="Current Password"
                        type="password"
                      />
                      <Input
                        label="New Password"
                        type="password"
                      />
                      <Input
                        label="Confirm New Password"
                        type="password"
                      />
                      <Button>Update Password</Button>
                    </div>
                  </Card.Content>
                </Card>

                <Card>
                  <Card.Header>
                    <Card.Title>Two-Factor Authentication</Card.Title>
                    <Card.Description>
                      Add an extra layer of security to your account
                    </Card.Description>
                  </Card.Header>
                  <Card.Content>
                    <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-emerald-900">2FA is enabled</p>
                          <p className="text-sm text-emerald-700">
                            Your account is protected with two-factor authentication
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </Card.Content>
                </Card>

                <Card>
                  <Card.Header>
                    <Card.Title>Active Sessions</Card.Title>
                    <Card.Description>
                      Manage your active sessions across devices
                    </Card.Description>
                  </Card.Header>
                  <Card.Content>
                    <div className="space-y-4">
                      {[
                        {
                          device: 'MacBook Pro',
                          location: 'San Francisco, CA',
                          current: true,
                        },
                        {
                          device: 'iPhone 15',
                          location: 'San Francisco, CA',
                          current: false,
                        },
                      ].map((session, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                        >
                          <div>
                            <p className="font-medium text-slate-900">
                              {session.device}
                              {session.current && (
                                <span className="ml-2 text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                                  Current
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-slate-500">{session.location}</p>
                          </div>
                          {!session.current && (
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              Revoke
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card.Content>
                </Card>
              </>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-slate-200">
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
