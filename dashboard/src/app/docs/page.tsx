import { ArrowRight, Shield, Zap, Scale, Globe } from 'lucide-react';
import Link from 'next/link';

export default function DocsIntroduction() {
  return (
    <article className="prose animate-fade-in">
      {/* Hero */}
      <div className="not-prose mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--primary-light)] text-[var(--casper-red)] rounded-full text-sm font-medium mb-4">
          <span className="w-2 h-2 bg-[var(--casper-red)] rounded-full animate-pulse-subtle" />
          Built on Casper Blockchain
        </div>
        <h1 className="text-4xl font-bold text-[var(--casper-dark)] mb-4">
          Términa Escrow Infrastructure
        </h1>
        <p className="text-xl text-[var(--foreground-secondary)] leading-relaxed max-w-2xl">
          A decentralized escrow system for trustless B2B payments. Create secure invoices
          with automated payment holds, multi-party approval, and on-chain dispute resolution.
        </p>
      </div>

      {/* Quick Start Cards */}
      <div className="not-prose grid grid-cols-2 gap-4 mb-12">
        <Link
          href="/docs/how-it-works"
          className="group p-6 bg-[var(--background-secondary)] rounded-xl border border-[var(--border)] hover:border-[var(--casper-red)] transition-colors"
        >
          <Zap className="w-8 h-8 text-[var(--casper-red)] mb-3" />
          <h3 className="font-semibold text-[var(--casper-dark)] mb-1 group-hover:text-[var(--casper-red)] transition-colors">
            How it Works
          </h3>
          <p className="text-sm text-[var(--muted)]">
            Understand the escrow flow and state machine
          </p>
        </Link>
        <Link
          href="/demo"
          className="group p-6 bg-[var(--casper-dark)] rounded-xl border border-transparent hover:bg-[var(--casper-dark-light)] transition-colors"
        >
          <ArrowRight className="w-8 h-8 text-[var(--casper-red)] mb-3" />
          <h3 className="font-semibold text-white mb-1">
            Try the Demo
          </h3>
          <p className="text-sm text-[var(--muted)]">
            See it working live on Casper testnet
          </p>
        </Link>
      </div>

      <h2 id="why-escrow">Why Blockchain Escrow?</h2>
      <p>
        Traditional B2B payments suffer from trust issues, delayed payments, and costly disputes.
        Términa solves this by leveraging Casper&apos;s blockchain to create a trustless payment infrastructure
        where funds are secured in smart contracts until all parties are satisfied.
      </p>

      {/* Features */}
      <div className="not-prose grid grid-cols-2 gap-6 my-8">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-lg bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-[var(--casper-red)]" />
          </div>
          <div>
            <h4 className="font-semibold text-[var(--casper-dark)] mb-1">Trustless Security</h4>
            <p className="text-sm text-[var(--muted)]">
              Funds are locked in smart contracts. No party can access them until conditions are met.
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-lg bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
            <Scale className="w-5 h-5 text-[var(--casper-red)]" />
          </div>
          <div>
            <h4 className="font-semibold text-[var(--casper-dark)] mb-1">Dispute Resolution</h4>
            <p className="text-sm text-[var(--muted)]">
              Built-in arbitration system with designated third-party arbiters.
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-lg bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-[var(--casper-red)]" />
          </div>
          <div>
            <h4 className="font-semibold text-[var(--casper-dark)] mb-1">Instant Settlement</h4>
            <p className="text-sm text-[var(--muted)]">
              Once released, funds are transferred immediately on-chain.
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-lg bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
            <Globe className="w-5 h-5 text-[var(--casper-red)]" />
          </div>
          <div>
            <h4 className="font-semibold text-[var(--casper-dark)] mb-1">Full Transparency</h4>
            <p className="text-sm text-[var(--muted)]">
              All transactions are recorded on the Casper blockchain for audit.
            </p>
          </div>
        </div>
      </div>

      <h2>The Escrow Lifecycle</h2>
      <p>
        Every escrow follows a clear state machine with six possible states:
      </p>

      {/* State Flow Diagram */}
      <div className="not-prose my-8 p-6 bg-[var(--casper-dark)] rounded-xl overflow-x-auto">
<pre className="text-sm text-[var(--muted)] font-mono whitespace-pre">
{`
┌───────────┐    accept    ┌────────────┐    fund     ┌──────────┐    release   ┌────────────┐
│   DRAFT         │ ──────►   │  ACCEPTED     │ ──────► │  FUNDED    │ ───────► │  RELEASED     │
└───────────┘                    └────────────┘                 └──────────┘                    └────────────┘
       │                                                     │                                        │
       │ cancel                                         │ cancel                           │ dispute
       ▼                                                    ▼                                        ▼
┌────────────┐              ┌────────────┐              ┌────────────┐
│  CANCELLED  │              │  CANCELLED   │              │  DISPUTED      │
└────────────┘              └────────────┘              └────────────┘
                                                             │
                                                     arbiter resolves
                                                             ▼
                                               ┌─────────────────────┐
                                               │ RELEASED / CANCELLED │
                                               └─────────────────────┘`}
</pre>

      </div>

      <h2>Technology Stack</h2>
      <ul>
        <li><strong>Blockchain:</strong> Casper Network (Testnet / Mainnet)</li>
        <li><strong>Smart Contracts:</strong> Rust + Odra Framework</li>
        <li><strong>Token Standard:</strong> CSPR native + CEP-18 tokens</li>
        <li><strong>Frontend:</strong> Next.js + TypeScript</li>
        <li><strong>Wallet Integration:</strong> Casper Wallet Extension</li>
      </ul>

      <h2>Getting Started</h2>
      <p>
        Ready to integrate Términa Escrow into your application? Start with our
        <Link href="/docs/how-it-works" className="text-[var(--casper-red)]"> How it Works</Link> guide
        to understand the flow, then check out the
        <Link href="/docs/integration" className="text-[var(--casper-red)]"> Integration</Link> docs
        for API references and code examples.
      </p>
      <p>
        Or, jump straight into the <Link href="/demo" className="text-[var(--casper-red)] font-semibold">Live Demo</Link> to
        see it working on Casper testnet.
      </p>
    </article>
  );
}
