export default function HowItWorks() {
  return (
    <article className="prose animate-fade-in">
      <h1>How it Works</h1>
      <p>
        Términa Escrow provides a trustless payment infrastructure where funds are held securely
        until all parties agree on the outcome. Here&apos;s how the system works.
      </p>

      <h2 id="flow">Escrow Flow</h2>
      <p>
        A typical escrow transaction involves three parties:
      </p>
      <ul>
        <li><strong>Issuer</strong> - Creates the invoice and receives payment</li>
        <li><strong>Payer</strong> - Accepts the invoice and deposits funds</li>
        <li><strong>Arbiter</strong> (optional) - Resolves disputes if they arise</li>
      </ul>

      <h3>Step 1: Invoice Creation</h3>
      <p>
        The issuer creates an escrow contract on the Casper blockchain with:
      </p>
      <ul>
        <li>Invoice description and amount</li>
        <li>Payer&apos;s wallet address</li>
        <li>Optional arbiter address for disputes</li>
        <li>Optional due date</li>
      </ul>
      <pre><code>{`// Contract deployment
const escrow = new EscrowContract({
  issuer: "0x123...",
  payer: "0x456...",
  amount: 1000_000_000_000, // 1000 CSPR in motes
  description: "Web development services"
});`}</code></pre>

      <h3>Step 2: Acceptance</h3>
      <p>
        The payer reviews the invoice terms and accepts them. This is an on-chain transaction
        that records the payer&apos;s agreement to the terms.
      </p>
      <pre><code>{`// Payer accepts the escrow terms
await escrow.accept();
// State: DRAFT → ACCEPTED`}</code></pre>

      <h3>Step 3: Funding</h3>
      <p>
        The payer deposits the required amount into the escrow contract. The funds are now
        locked and cannot be accessed by either party until released.
      </p>
      <pre><code>{`// Payer deposits funds
await escrow.fund({ amount: 1000_000_000_000 });
// State: ACCEPTED → FUNDED`}</code></pre>

      <h3>Step 4: Release</h3>
      <p>
        When the payer is satisfied with the delivered goods or services, they release
        the funds to the issuer. This completes the escrow.
      </p>
      <pre><code>{`// Payer releases funds to issuer
await escrow.release();
// State: FUNDED → RELEASED
// Funds transferred to issuer`}</code></pre>

      <h2 id="states">State Machine</h2>
      <p>
        The escrow contract implements a strict state machine with the following states:
      </p>

      <div className="not-prose overflow-x-auto my-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left py-3 px-4 font-semibold text-[var(--casper-dark)]">State</th>
              <th className="text-left py-3 px-4 font-semibold text-[var(--casper-dark)]">Description</th>
              <th className="text-left py-3 px-4 font-semibold text-[var(--casper-dark)]">Allowed Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 px-4"><code className="text-[var(--casper-red)]">DRAFT</code></td>
              <td className="py-3 px-4 text-[var(--muted)]">Initial state after creation</td>
              <td className="py-3 px-4 text-[var(--muted)]">accept, cancel</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 px-4"><code className="text-[var(--casper-red)]">ACCEPTED</code></td>
              <td className="py-3 px-4 text-[var(--muted)]">Payer agreed to terms</td>
              <td className="py-3 px-4 text-[var(--muted)]">fund, cancel</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 px-4"><code className="text-[var(--casper-red)]">FUNDED</code></td>
              <td className="py-3 px-4 text-[var(--muted)]">Funds deposited in contract</td>
              <td className="py-3 px-4 text-[var(--muted)]">release, dispute</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 px-4"><code className="text-emerald-600">RELEASED</code></td>
              <td className="py-3 px-4 text-[var(--muted)]">Funds sent to issuer</td>
              <td className="py-3 px-4 text-[var(--muted)]">none (final)</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 px-4"><code className="text-gray-500">CANCELLED</code></td>
              <td className="py-3 px-4 text-[var(--muted)]">Escrow cancelled, funds returned</td>
              <td className="py-3 px-4 text-[var(--muted)]">none (final)</td>
            </tr>
            <tr>
              <td className="py-3 px-4"><code className="text-amber-600">DISPUTED</code></td>
              <td className="py-3 px-4 text-[var(--muted)]">Dispute raised, awaiting arbiter</td>
              <td className="py-3 px-4 text-[var(--muted)]">resolve (arbiter only)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="disputes">Dispute Resolution</h2>
      <p>
        If there&apos;s a disagreement between issuer and payer, either party can raise a dispute
        when the escrow is in the <code>FUNDED</code> state.
      </p>

      <h3>Raising a Dispute</h3>
      <pre><code>{`// Either party can dispute
await escrow.dispute("Deliverables not as specified");
// State: FUNDED → DISPUTED`}</code></pre>

      <h3>Arbiter Resolution</h3>
      <p>
        The designated arbiter reviews the case and makes a decision:
      </p>
      <ul>
        <li><strong>Release to Issuer</strong> - Arbiter sides with the issuer</li>
        <li><strong>Refund to Payer</strong> - Arbiter sides with the payer</li>
      </ul>
      <pre><code>{`// Arbiter resolves the dispute
await escrow.resolveDispute({
  releaseToIssuer: true // or false for refund
});
// State: DISPUTED → RELEASED or CANCELLED`}</code></pre>

      <blockquote>
        <strong>Note:</strong> If no arbiter is specified during escrow creation, disputes
        can only be resolved by mutual agreement between issuer and payer.
      </blockquote>

      <h2>On-Chain Data</h2>
      <p>
        All escrow data is stored on the Casper blockchain:
      </p>
      <ul>
        <li>Invoice metadata (ID, description, amount, dates)</li>
        <li>Party addresses (issuer, payer, arbiter)</li>
        <li>Current state and balance</li>
        <li>Event history for full audit trail</li>
      </ul>
      <p>
        This ensures complete transparency and immutability. All transactions can be verified
        on the <a href="https://testnet.cspr.live" target="_blank" rel="noopener noreferrer">Casper Explorer</a>.
      </p>
    </article>
  );
}
