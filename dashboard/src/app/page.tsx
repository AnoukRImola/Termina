import { Button } from '@/components/ui/Button';
import { ArrowRight, CheckCircle2, Shield, Zap, Building2 } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Funds are held securely until all conditions are met. No more payment disputes or delays.',
  },
  {
    icon: Zap,
    title: 'Instant Processing',
    description: 'Automated workflows ensure payments are released immediately upon approval.',
  },
  {
    icon: CheckCircle2,
    title: 'Complete Transparency',
    description: 'Both parties have full visibility into invoice status and payment conditions.',
  },
];

const stats = [
  { value: '$2.5M+', label: 'Processed Monthly' },
  { value: '500+', label: 'Active Businesses' },
  { value: '99.9%', label: 'Uptime' },
  { value: '<24h', label: 'Payment Release' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-800 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-slate-900">Termina</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              How It Works
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/dashboard">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-sm font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse-subtle" />
              Trusted by 500+ businesses
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
              Invoice Management with{' '}
              <span className="text-blue-800">Guaranteed Payments</span>
            </h1>

            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Stop chasing payments. Termina ensures your invoices get paid on time with
              conditional payment holds and automated release workflows.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="lg">
                  See How It Works
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Why Businesses Choose Termina
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our platform streamlines B2B payments with built-in protection for both parties.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-blue-800" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Simple, Secure Process
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Get started in minutes with our straightforward workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Create Invoice', desc: 'Enter invoice details and payment terms' },
              { step: '02', title: 'Client Accepts', desc: 'Your client reviews and approves the invoice' },
              { step: '03', title: 'Payment Secured', desc: 'Funds are held securely in escrow' },
              { step: '04', title: 'Auto Release', desc: 'Payment released upon conditions met' },
            ].map((item, index) => (
              <div key={item.step} className="relative">
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-slate-200 -translate-x-1/2" />
                )}
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-800 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-blue-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to streamline your payments?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of businesses already using Termina for secure invoicing.
          </p>
          <Link href="/dashboard">
            <Button size="lg" variant="secondary">
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-800 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900">Termina</span>
          </div>
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Termina. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
