import { Database, Server, Wallet, ArrowRight, ExternalLink, CheckCircle, Key } from 'lucide-react';
import Link from 'next/link';

export default function DemoPage() {
  return (
    <article className="prose animate-fade-in">
      <h1>Demo & On-Chain Data</h1>
      <p>
        This section explains how the live demo works, what data is stored on the Casper blockchain,
        and how to verify transactions yourself on the block explorer.
      </p>

      <h2 id="how-demo-works">How the Demo Works</h2>
      <p>
        The demo showcases a complete B2B invoice escrow workflow running on <strong>Casper 2.0 testnet</strong>.
        When you interact with the demo, you&apos;re executing real blockchain transactions.
      </p>

      <h3>Architecture Overview</h3>
      <div className="not-prose my-6 p-6 bg-[var(--casper-dark)] rounded-xl">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3">
              <Wallet className="w-6 h-6 text-[var(--casper-red)]" />
            </div>
            <div className="text-white font-semibold mb-1">Demo Wallet</div>
            <div className="text-xs text-[var(--muted)]">Pre-funded testnet account for demo transactions</div>
          </div>
          <div className="p-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3">
              <Server className="w-6 h-6 text-[var(--casper-red)]" />
            </div>
            <div className="text-white font-semibold mb-1">Next.js Backend</div>
            <div className="text-xs text-[var(--muted)]">API routes handle transaction signing & submission</div>
          </div>
          <div className="p-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3">
              <Database className="w-6 h-6 text-[var(--casper-red)]" />
            </div>
            <div className="text-white font-semibold mb-1">Casper Testnet</div>
            <div className="text-xs text-[var(--muted)]">Smart contract deployed, state stored on-chain</div>
          </div>
        </div>
        <div className="flex justify-center gap-2 mt-4 text-[var(--muted)] text-sm">
          <span>User Action</span>
          <ArrowRight className="w-4 h-4" />
          <span>API Signs TX</span>
          <ArrowRight className="w-4 h-4" />
          <span>Submit to Casper</span>
          <ArrowRight className="w-4 h-4" />
          <span>On-Chain Execution</span>
        </div>
      </div>

      <h3>Demo Account Configuration</h3>
      <p>
        The demo uses a pre-funded testnet account to pay for gas and escrow funding.
        This allows judges and testers to experience the full workflow without needing their own testnet CSPR.
      </p>

      <div className="not-prose my-6 p-4 bg-[var(--background-secondary)] rounded-lg border border-[var(--border)]">
        <div className="flex items-center gap-2 mb-3">
          <Key className="w-5 h-5 text-[var(--casper-red)]" />
          <span className="font-semibold text-[var(--casper-dark)]">Demo Account</span>
        </div>
        <div className="font-mono text-xs text-[var(--muted)] break-all">
          Public Key: 0203ff8cba4d2a6019845d95ade52b110eea6dda8fa28180f234c5def1f2872d7393
        </div>
        <div className="mt-2 text-xs text-[var(--muted)]">
          This account serves as both issuer and payer in the demo for simplicity.
          In production, these would be separate accounts controlled by different parties.
        </div>
      </div>

      <h2 id="on-chain-data">What Gets Stored On-Chain</h2>
      <p>
        Every escrow creates a smart contract instance on Casper with the following data
        stored in the contract&apos;s Named Keys:
      </p>

      <div className="not-prose overflow-x-auto my-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left py-3 px-4 font-semibold text-[var(--casper-dark)]">Key</th>
              <th className="text-left py-3 px-4 font-semibold text-[var(--casper-dark)]">Type</th>
              <th className="text-left py-3 px-4 font-semibold text-[var(--casper-dark)]">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 px-4"><code>state</code></td>
              <td className="py-3 px-4 text-[var(--muted)]">U8</td>
              <td className="py-3 px-4 text-[var(--muted)]">Current escrow state (0=Draft, 1=Accepted, 2=Funded, 3=Released, 4=Cancelled)</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 px-4"><code>issuer</code></td>
              <td className="py-3 px-4 text-[var(--muted)]">AccountHash</td>
              <td className="py-3 px-4 text-[var(--muted)]">Address of the party receiving payment</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 px-4"><code>payer</code></td>
              <td className="py-3 px-4 text-[var(--muted)]">AccountHash</td>
              <td className="py-3 px-4 text-[var(--muted)]">Address of the party making payment</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 px-4"><code>amount</code></td>
              <td className="py-3 px-4 text-[var(--muted)]">U512</td>
              <td className="py-3 px-4 text-[var(--muted)]">Required escrow amount in motes (1 CSPR = 10^9 motes)</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 px-4"><code>description</code></td>
              <td className="py-3 px-4 text-[var(--muted)]">String</td>
              <td className="py-3 px-4 text-[var(--muted)]">Invoice description stored on-chain</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 px-4"><code>balance</code></td>
              <td className="py-3 px-4 text-[var(--muted)]">U512</td>
              <td className="py-3 px-4 text-[var(--muted)]">Current balance held in escrow</td>
            </tr>
            <tr>
              <td className="py-3 px-4"><code>escrow_purse</code></td>
              <td className="py-3 px-4 text-[var(--muted)]">URef</td>
              <td className="py-3 px-4 text-[var(--muted)]">Purse holding the escrowed funds</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>State Transitions</h3>
      <p>
        Each state transition is recorded as a blockchain transaction (deploy):
      </p>

      <div className="not-prose my-6 p-6 bg-[var(--background-secondary)] rounded-xl">
<pre className="text-sm text-[var(--casper-dark)] font-mono whitespace-pre overflow-x-auto">
{`Deploy Contract (call)
├── Args: amount (U64), description (String)
├── Creates: escrow_package, escrow_contract
├── Initial state: Draft (0)
└── Gas: ~10 CSPR

accept()
├── Caller: must be payer
├── Validates: state == Draft
├── Updates: state → Accepted (1)
└── Gas: ~2.5 CSPR

fund()
├── Args: amount (U512), source (URef)
├── Caller: must be payer
├── Validates: state == Accepted, amount >= required
├── Transfers: CSPR from source purse to escrow_purse
├── Updates: state → Funded (2), balance = amount
└── Gas: ~2.5 CSPR

release()
├── Caller: must be payer
├── Validates: state == Funded
├── Transfers: balance from escrow_purse to issuer
├── Updates: state → Released (3), balance = 0
└── Gas: ~2.5 CSPR`}
</pre>
      </div>

      <h3>Verifying On-Chain</h3>
      <p>
        Every transaction can be verified on the Casper block explorer:
      </p>
      <ol>
        <li>Copy the deploy hash shown after any action in the demo</li>
        <li>
          Go to{' '}
          <a href="https://testnet.cspr.live" target="_blank" rel="noopener noreferrer" className="text-[var(--casper-red)]">
            testnet.cspr.live <ExternalLink className="w-3 h-3 inline" />
          </a>
        </li>
        <li>Search for the deploy hash</li>
        <li>View execution results, gas used, and state changes</li>
      </ol>

      <div className="not-prose my-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span className="font-semibold text-emerald-800">Successfully Deployed Contract</span>
        </div>
        <div className="text-sm text-emerald-700">
          The escrow smart contract has been deployed to Casper testnet. Deploy hash:{' '}
          <a
            href="https://testnet.cspr.live/deploy/86d45c8af4cf8965de7dc208cfad1d4169b88d10d05a7f6002449c4452e9de22"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs underline"
          >
            86d45c8a...e9de22 <ExternalLink className="w-3 h-3 inline" />
          </a>
        </div>
      </div>

      <h2 id="try-it">Try It Yourself</h2>
      <p>
        Ready to see the infrastructure in action? The live demo lets you:
      </p>

      <div className="not-prose grid grid-cols-2 gap-4 my-6">
        <div className="p-4 border border-[var(--border)] rounded-lg">
          <div className="font-semibold text-[var(--casper-dark)] mb-1">1. Create Invoice</div>
          <p className="text-xs text-[var(--muted)]">Deploy a new escrow contract with description and amount</p>
        </div>
        <div className="p-4 border border-[var(--border)] rounded-lg">
          <div className="font-semibold text-[var(--casper-dark)] mb-1">2. Accept Terms</div>
          <p className="text-xs text-[var(--muted)]">Payer reviews and accepts the escrow terms</p>
        </div>
        <div className="p-4 border border-[var(--border)] rounded-lg">
          <div className="font-semibold text-[var(--casper-dark)] mb-1">3. Fund Escrow</div>
          <p className="text-xs text-[var(--muted)]">Deposit CSPR into the escrow contract</p>
        </div>
        <div className="p-4 border border-[var(--border)] rounded-lg">
          <div className="font-semibold text-[var(--casper-dark)] mb-1">4. Release Payment</div>
          <p className="text-xs text-[var(--muted)]">Transfer funds to issuer and complete the escrow</p>
        </div>
      </div>

      <div className="not-prose">
        <Link
          href="/demo"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--casper-red)] text-white font-semibold rounded-lg hover:bg-[var(--casper-red-dark)] transition-colors"
        >
          Launch Live Demo
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <h2>Technical Details</h2>
      <p>
        For developers who want to understand the implementation:
      </p>
      <ul>
        <li>
          <strong>Smart Contract:</strong> Native Rust contract using <code>casper-contract 5.x</code> and <code>casper-types 6.x</code>
        </li>
        <li>
          <strong>Entry Points:</strong> <code>accept</code>, <code>fund</code>, <code>release</code>, <code>cancel</code>, <code>get_state</code>, <code>get_balance</code>
        </li>
        <li>
          <strong>SDK:</strong> <code>casper-js-sdk 5.0.7</code> for transaction building and submission
        </li>
        <li>
          <strong>Key Derivation:</strong> BIP39/BIP44 with Casper coin type (506)
        </li>
      </ul>

      <p>
        Check the{' '}
        <Link href="/docs/smart-contract" className="text-[var(--casper-red)]">Smart Contract</Link>{' '}
        and{' '}
        <Link href="/docs/integration" className="text-[var(--casper-red)]">Integration</Link>{' '}
        sections for full technical documentation.
      </p>
    </article>
  );
}
