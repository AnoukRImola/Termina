import { FileText, Truck, Building, Cloud, Shield, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function UseCases() {
  return (
    <article className="prose animate-fade-in">
      <h1>Enterprise Use Cases</h1>
      <p>
        Términa&apos;s programmable escrow infrastructure is designed for enterprise workflows
        that require trustless conditional payments. Here are the primary use cases where
        this infrastructure provides significant value.
      </p>

      <div className="not-prose mb-8 p-4 bg-[var(--primary-light)] rounded-lg border border-[var(--casper-red)]/20">
        <p className="text-sm text-[var(--casper-dark)]">
          <strong>Note:</strong> The demo showcases B2B invoicing as a reference implementation.
          The same infrastructure can be adapted to any conditional payment workflow.
        </p>
      </div>

      <h2 id="invoicing">B2B Invoice Payments</h2>
      <div className="not-prose flex gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
          <FileText className="w-6 h-6 text-[var(--casper-red)]" />
        </div>
        <div>
          <h3 className="font-semibold text-[var(--casper-dark)] mb-2">The Problem</h3>
          <p className="text-sm text-[var(--muted)]">
            B2B payments suffer from trust gaps: vendors deliver services without payment guarantees,
            buyers pay without delivery guarantees. Late payments cost businesses $3 trillion annually
            in the US alone.
          </p>
        </div>
      </div>

      <h3>How Términa Solves It</h3>
      <ul>
        <li><strong>Funds in escrow before work begins:</strong> Payer deposits funds that are locked until delivery</li>
        <li><strong>Clear release conditions:</strong> Both parties agree on terms before any money moves</li>
        <li><strong>Instant settlement:</strong> Once payer approves, funds transfer immediately</li>
        <li><strong>Dispute resolution:</strong> Designated arbiter can resolve conflicts</li>
      </ul>

      <div className="not-prose my-6 p-4 bg-[var(--background-secondary)] rounded-lg">
        <h4 className="font-semibold text-[var(--casper-dark)] mb-2">Example Flow</h4>
        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <span className="px-2 py-1 bg-[var(--casper-dark)] text-white rounded">Vendor creates invoice</span>
          <ArrowRight className="w-4 h-4" />
          <span className="px-2 py-1 bg-[var(--casper-dark)] text-white rounded">Client accepts & funds</span>
          <ArrowRight className="w-4 h-4" />
          <span className="px-2 py-1 bg-[var(--casper-dark)] text-white rounded">Work delivered</span>
          <ArrowRight className="w-4 h-4" />
          <span className="px-2 py-1 bg-emerald-600 text-white rounded">Client releases payment</span>
        </div>
      </div>

      <hr className="my-8" />

      <h2 id="supply-chain">Supply Chain & Trade Finance</h2>
      <div className="not-prose flex gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
          <Truck className="w-6 h-6 text-[var(--casper-red)]" />
        </div>
        <div>
          <h3 className="font-semibold text-[var(--casper-dark)] mb-2">The Problem</h3>
          <p className="text-sm text-[var(--muted)]">
            International trade involves multiple parties (buyer, seller, shipper, customs, banks)
            with different trust levels. Letters of Credit are slow, expensive, and paper-based.
          </p>
        </div>
      </div>

      <h3>How Términa Solves It</h3>
      <ul>
        <li><strong>Multi-party escrow:</strong> Configure multiple participants with different roles</li>
        <li><strong>Milestone-based releases:</strong> Partial payments on shipment, delivery, inspection</li>
        <li><strong>IoT integration ready:</strong> Release conditions can be triggered by external oracles</li>
        <li><strong>Full audit trail:</strong> Every state change recorded on-chain for compliance</li>
      </ul>

      <div className="not-prose my-6 grid grid-cols-3 gap-4">
        <div className="p-4 bg-[var(--background-secondary)] rounded-lg text-center">
          <Shield className="w-8 h-8 text-[var(--casper-red)] mx-auto mb-2" />
          <div className="font-semibold text-[var(--casper-dark)] text-sm">Reduced Counterparty Risk</div>
          <div className="text-xs text-[var(--muted)]">Funds secured until delivery confirmed</div>
        </div>
        <div className="p-4 bg-[var(--background-secondary)] rounded-lg text-center">
          <Clock className="w-8 h-8 text-[var(--casper-red)] mx-auto mb-2" />
          <div className="font-semibold text-[var(--casper-dark)] text-sm">Faster Settlement</div>
          <div className="text-xs text-[var(--muted)]">Days instead of weeks</div>
        </div>
        <div className="p-4 bg-[var(--background-secondary)] rounded-lg text-center">
          <CheckCircle className="w-8 h-8 text-[var(--casper-red)] mx-auto mb-2" />
          <div className="font-semibold text-[var(--casper-dark)] text-sm">Automated Compliance</div>
          <div className="text-xs text-[var(--muted)]">Immutable audit records</div>
        </div>
      </div>

      <hr className="my-8" />

      <h2 id="real-estate">Real Estate Transactions</h2>
      <div className="not-prose flex gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
          <Building className="w-6 h-6 text-[var(--casper-red)]" />
        </div>
        <div>
          <h3 className="font-semibold text-[var(--casper-dark)] mb-2">The Problem</h3>
          <p className="text-sm text-[var(--muted)]">
            Real estate transactions involve large sums, multiple parties (buyer, seller, agents, lawyers,
            title companies), and lengthy settlement periods. Traditional escrow services charge 1-2% fees.
          </p>
        </div>
      </div>

      <h3>How Términa Solves It</h3>
      <ul>
        <li><strong>Trustless earnest money:</strong> Deposits held in smart contract, not third-party accounts</li>
        <li><strong>Conditional release:</strong> Funds released only when title transfer is confirmed</li>
        <li><strong>Multi-signature support:</strong> Require approval from multiple parties</li>
        <li><strong>Transparent costs:</strong> Only blockchain gas fees, no percentage-based charges</li>
      </ul>

      <blockquote>
        <strong>Enterprise consideration:</strong> Real estate transactions can be tokenized on Casper,
        enabling the escrow to handle both the payment and the property token transfer atomically.
      </blockquote>

      <hr className="my-8" />

      <h2 id="saas">SaaS & Software Licensing</h2>
      <div className="not-prose flex gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
          <Cloud className="w-6 h-6 text-[var(--casper-red)]" />
        </div>
        <div>
          <h3 className="font-semibold text-[var(--casper-dark)] mb-2">The Problem</h3>
          <p className="text-sm text-[var(--muted)]">
            Enterprise software contracts often involve implementation phases, SLAs, and milestone-based
            payments. Disputes over deliverables delay payments and strain relationships.
          </p>
        </div>
      </div>

      <h3>How Términa Solves It</h3>
      <ul>
        <li><strong>Milestone escrows:</strong> Payment released as each implementation phase completes</li>
        <li><strong>SLA-linked releases:</strong> Integrate with monitoring to verify uptime before payment</li>
        <li><strong>Subscription escrows:</strong> Pre-fund monthly/yearly subscriptions with clear terms</li>
        <li><strong>Automatic renewals:</strong> Smart contract handles recurring conditional payments</li>
      </ul>

      <hr className="my-8" />

      <h2>Other Enterprise Applications</h2>
      <p>
        The programmable nature of Términa infrastructure means it can be adapted to virtually any
        conditional payment scenario:
      </p>

      <div className="not-prose grid grid-cols-2 gap-4 my-6">
        <div className="p-4 border border-[var(--border)] rounded-lg">
          <h4 className="font-semibold text-[var(--casper-dark)] mb-1">M&A Transactions</h4>
          <p className="text-xs text-[var(--muted)]">Earnout payments tied to post-acquisition performance</p>
        </div>
        <div className="p-4 border border-[var(--border)] rounded-lg">
          <h4 className="font-semibold text-[var(--casper-dark)] mb-1">Freelance Platforms</h4>
          <p className="text-xs text-[var(--muted)]">Secure payments for gig economy workers</p>
        </div>
        <div className="p-4 border border-[var(--border)] rounded-lg">
          <h4 className="font-semibold text-[var(--casper-dark)] mb-1">Insurance Payouts</h4>
          <p className="text-xs text-[var(--muted)]">Parametric insurance with automatic triggers</p>
        </div>
        <div className="p-4 border border-[var(--border)] rounded-lg">
          <h4 className="font-semibold text-[var(--casper-dark)] mb-1">Crowdfunding</h4>
          <p className="text-xs text-[var(--muted)]">All-or-nothing campaigns with trustless refunds</p>
        </div>
      </div>

      <h2>Next Steps</h2>
      <p>
        Ready to see the infrastructure in action? Check out our{' '}
        <Link href="/docs/demo" className="text-[var(--casper-red)]">Demo & On-Chain Data</Link>{' '}
        section to understand exactly what gets stored on the blockchain, or jump into the{' '}
        <Link href="/demo" className="text-[var(--casper-red)] font-semibold">Live Demo</Link>{' '}
        to try it yourself.
      </p>
    </article>
  );
}
