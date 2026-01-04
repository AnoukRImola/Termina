import { ArrowRight, Shield, Zap, Scale, Globe, Building2, Boxes } from 'lucide-react';
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
          Programmable Escrow Infrastructure
        </h1>
        <p className="text-xl text-[var(--foreground-secondary)] leading-relaxed max-w-2xl">
          A modular, enterprise-ready escrow infrastructure for building trustless financial workflows.
          Deploy customizable smart contracts that automate conditional payments, multi-party approvals,
          and dispute resolution on the Casper blockchain.
        </p>
      </div>

      {/* What is this */}
      <div className="not-prose mb-10 p-6 bg-gradient-to-r from-[var(--casper-dark)] to-[var(--casper-dark-light)] rounded-xl">
        <h3 className="!text-white font-semibold mb-3 flex items-center gap-2">
          <Boxes className="w-5 h-5 text-[var(--casper-red)]" />
          What is Programmable Escrow Infrastructure?
        </h3>
        <p className="text-[var(--muted)] text-sm leading-relaxed mb-4">
          Términa provides the <strong className="text-white">building blocks</strong> for creating any escrow-based workflow.
          Unlike traditional payment processors, our infrastructure gives you full control over the escrow logic,
          allowing you to define custom conditions, participants, and resolution mechanisms.
        </p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="text-2xl font-bold text-[var(--casper-red)]">Modular</div>
            <div className="text-xs text-[var(--muted)]">Composable components</div>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="text-2xl font-bold text-[var(--casper-red)]">Trustless</div>
            <div className="text-xs text-[var(--muted)]">Smart contract enforced</div>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="text-2xl font-bold text-[var(--casper-red)]">Enterprise</div>
            <div className="text-xs text-[var(--muted)]">Built for scale</div>
          </div>
        </div>
      </div>

      {/* Quick Start Cards */}
      <div className="not-prose grid grid-cols-2 gap-4 mb-12">
        <Link
          href="/docs/use-cases"
          className="group p-6 bg-[var(--background-secondary)] rounded-xl border border-[var(--border)] hover:border-[var(--casper-red)] transition-colors"
        >
          <Building2 className="w-8 h-8 text-[var(--casper-red)] mb-3" />
          <h3 className="font-semibold text-[var(--casper-dark)] mb-1 group-hover:text-[var(--casper-red)] transition-colors">
            Enterprise Use Cases
          </h3>
          <p className="text-sm text-[var(--muted)]">
            See how enterprises use this infrastructure
          </p>
        </Link>
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
          href="/docs/demo"
          className="group p-6 bg-[var(--background-secondary)] rounded-xl border border-[var(--border)] hover:border-[var(--casper-red)] transition-colors"
        >
          <ArrowRight className="w-8 h-8 text-[var(--casper-red)] mb-3" />
          <h3 className="font-semibold text-[var(--casper-dark)] mb-1 group-hover:text-[var(--casper-red)] transition-colors">
            Demo & On-Chain Data
          </h3>
          <p className="text-sm text-[var(--muted)]">
            How the demo works and what&apos;s stored on blockchain
          </p>
        </Link>
        <Link
          href="/demo"
          className="group p-6 bg-[var(--casper-dark)] rounded-xl border border-transparent hover:bg-[var(--casper-dark-light)] transition-colors"
        >
          <ArrowRight className="w-8 h-8 text-[var(--casper-red)] mb-3" />
          <h3 className="!font-semibold !text-white mb-1">
            Try it Live
          </h3>
          <p className="text-sm text-[var(--muted)]">
            Experience the infrastructure on Casper testnet
          </p>
        </Link>
      </div>

      <h2 id="why-escrow">Why Blockchain-Based Escrow Infrastructure?</h2>
      <p>
        Enterprise financial workflows often require conditional payments with multiple stakeholders.
        Traditional solutions rely on intermediaries, manual processes, and fragmented systems.
        Términa provides a <strong>programmable infrastructure layer</strong> that enterprises can
        integrate into their existing workflows, enabling trustless automation at scale.
      </p>

      {/* Features */}
      <div className="not-prose grid grid-cols-2 gap-6 my-8">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-lg bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-[var(--casper-red)]" />
          </div>
          <div>
            <h4 className="font-semibold text-[var(--casper-dark)] mb-1">Trustless Execution</h4>
            <p className="text-sm text-[var(--muted)]">
              Smart contracts enforce conditions automatically. No intermediary can alter the rules.
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-lg bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
            <Scale className="w-5 h-5 text-[var(--casper-red)]" />
          </div>
          <div>
            <h4 className="font-semibold text-[var(--casper-dark)] mb-1">Configurable Arbitration</h4>
            <p className="text-sm text-[var(--muted)]">
              Define your own dispute resolution logic with designated arbiters or DAOs.
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
              When conditions are met, funds transfer immediately on-chain. No delays.
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-lg bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
            <Globe className="w-5 h-5 text-[var(--casper-red)]" />
          </div>
          <div>
            <h4 className="font-semibold text-[var(--casper-dark)] mb-1">Complete Audit Trail</h4>
            <p className="text-sm text-[var(--muted)]">
              Every state change is recorded immutably on-chain for compliance and auditing.
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
        <li><strong>Blockchain:</strong> Casper Network 2.0 (enterprise-grade, upgradeable contracts)</li>
        <li><strong>Smart Contracts:</strong> Native Rust (casper-contract 5.x, casper-types 6.x)</li>
        <li><strong>Token Support:</strong> CSPR native + CEP-18 tokens</li>
        <li><strong>Integration:</strong> TypeScript SDK (casper-js-sdk 5.0)</li>
        <li><strong>Demo Frontend:</strong> Next.js 16 + React 19</li>
      </ul>

      <h2>Why Casper for Enterprise Escrow?</h2>
      <p>
        Casper blockchain is designed for enterprise adoption with features like:
      </p>
      <ul>
        <li><strong>Upgradeable Contracts:</strong> Fix bugs or add features without redeploying</li>
        <li><strong>Low & Predictable Gas:</strong> Stable costs for business planning</li>
        <li><strong>Account Abstraction:</strong> Flexible key management and permissions</li>
        <li><strong>Enterprise Support:</strong> Backed by enterprise-focused ecosystem</li>
      </ul>

      <h2>Getting Started</h2>
      <p>
        Ready to build on Términa infrastructure? Here&apos;s the recommended path:
      </p>
      <ol>
        <li>
          <Link href="/docs/use-cases" className="text-[var(--casper-red)]">Explore use cases</Link> to
          see how this infrastructure applies to your domain
        </li>
        <li>
          <Link href="/docs/demo" className="text-[var(--casper-red)]">Understand the demo</Link> to
          see what gets stored on-chain
        </li>
        <li>
          <Link href="/docs/how-it-works" className="text-[var(--casper-red)]">Learn how it works</Link> to
          understand the escrow state machine
        </li>
        <li>
          <Link href="/docs/integration" className="text-[var(--casper-red)]">Integrate</Link> using
          our SDK and smart contract APIs
        </li>
      </ol>
      <p>
        Or, jump straight into the <Link href="/demo" className="text-[var(--casper-red)] font-semibold">Live Demo</Link> to
        experience the infrastructure on Casper testnet.
      </p>
    </article>
  );
}
