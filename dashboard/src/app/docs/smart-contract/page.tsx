export default function SmartContract() {
  return (
    <article className="prose animate-fade-in">
      <h1>Smart Contract</h1>
      <p>
        The Términa Escrow smart contract is written in Rust using the Odra framework,
        providing type-safe, gas-efficient escrow operations on the Casper blockchain.
      </p>

      <h2 id="architecture">Architecture</h2>
      <p>
        The contract is designed as a single, self-contained module that manages the
        entire escrow lifecycle:
      </p>
      <pre><code>{`#[odra::module]
pub struct Escrow {
    // Invoice data
    invoice: Var<Invoice>,

    // Escrow state
    state: Var<EscrowState>,
    balance: Var<U512>,

    // Dispute info
    dispute_reason: Var<Option<String>>,
}`}</code></pre>

      <h3>Data Structures</h3>
      <pre><code>{`#[derive(OdraType)]
pub struct Invoice {
    pub id: String,
    pub description: String,
    pub amount: U512,
    pub issuer_address: Address,
    pub payer_address: Address,
    pub arbiter_address: Option<Address>,
    pub created_at: u64,
    pub due_date: Option<u64>,
}

#[derive(OdraType)]
pub enum EscrowState {
    Draft,
    Accepted,
    Funded,
    Released,
    Cancelled,
    Disputed,
}`}</code></pre>

      <h2 id="entry-points">Entry Points</h2>
      <p>
        The contract exposes the following callable methods:
      </p>

      <h3>init</h3>
      <p>Initializes a new escrow contract with invoice details.</p>
      <pre><code>{`#[odra(init)]
pub fn init(&mut self, config: EscrowConfig) {
    // Only callable once during deployment
    // Sets up invoice, initial state = Draft
}`}</code></pre>

      <h3>accept</h3>
      <p>Payer accepts the escrow terms.</p>
      <pre><code>{`pub fn accept(&mut self) {
    // Caller must be payer
    // State must be Draft
    // Transitions to Accepted
}`}</code></pre>

      <h3>fund</h3>
      <p>Payer deposits funds into the escrow.</p>
      <pre><code>{`#[odra(payable)]
pub fn fund(&mut self) {
    // Caller must be payer
    // State must be Accepted
    // Amount must be >= invoice.amount
    // Transitions to Funded
}`}</code></pre>

      <h3>release</h3>
      <p>Payer releases funds to the issuer.</p>
      <pre><code>{`pub fn release(&mut self) {
    // Caller must be payer
    // State must be Funded
    // Transfers balance to issuer
    // Transitions to Released
}`}</code></pre>

      <h3>cancel</h3>
      <p>Cancel the escrow and return any funds.</p>
      <pre><code>{`pub fn cancel(&mut self) {
    // Callable by issuer (in Draft) or both (in Accepted)
    // If Funded, only via dispute resolution
    // Returns funds to payer if any
    // Transitions to Cancelled
}`}</code></pre>

      <h3>dispute</h3>
      <p>Raise a dispute when funded.</p>
      <pre><code>{`pub fn dispute(&mut self, reason: String) {
    // Caller must be issuer or payer
    // State must be Funded
    // Stores dispute reason
    // Transitions to Disputed
}`}</code></pre>

      <h3>resolve_dispute</h3>
      <p>Arbiter resolves the dispute.</p>
      <pre><code>{`pub fn resolve_dispute(&mut self, release_to_issuer: bool) {
    // Caller must be arbiter
    // State must be Disputed
    // If true: releases to issuer
    // If false: refunds to payer
}`}</code></pre>

      <h3>View Methods</h3>
      <pre><code>{`pub fn get_state(&self) -> EscrowState;
pub fn get_invoice(&self) -> Invoice;
pub fn get_balance(&self) -> U512;
pub fn get_dispute_reason(&self) -> Option<String>;`}</code></pre>

      <h2 id="events">Events</h2>
      <p>
        The contract emits events for all state changes, enabling off-chain indexing and notifications:
      </p>

      <div className="not-prose overflow-x-auto my-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left py-3 px-4 font-semibold text-[var(--casper-dark)]">Event</th>
              <th className="text-left py-3 px-4 font-semibold text-[var(--casper-dark)]">Data</th>
              <th className="text-left py-3 px-4 font-semibold text-[var(--casper-dark)]">Emitted When</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 px-4"><code>EscrowCreated</code></td>
              <td className="py-3 px-4 text-[var(--muted)]">invoice_id, issuer, payer, amount</td>
              <td className="py-3 px-4 text-[var(--muted)]">Contract deployed</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 px-4"><code>EscrowAccepted</code></td>
              <td className="py-3 px-4 text-[var(--muted)]">invoice_id, payer</td>
              <td className="py-3 px-4 text-[var(--muted)]">Payer accepts</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 px-4"><code>FundsDeposited</code></td>
              <td className="py-3 px-4 text-[var(--muted)]">invoice_id, amount</td>
              <td className="py-3 px-4 text-[var(--muted)]">Payer funds escrow</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 px-4"><code>FundsReleased</code></td>
              <td className="py-3 px-4 text-[var(--muted)]">invoice_id, recipient, amount</td>
              <td className="py-3 px-4 text-[var(--muted)]">Funds released to issuer</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 px-4"><code>EscrowCancelled</code></td>
              <td className="py-3 px-4 text-[var(--muted)]">invoice_id, cancelled_by</td>
              <td className="py-3 px-4 text-[var(--muted)]">Escrow cancelled</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 px-4"><code>DisputeRaised</code></td>
              <td className="py-3 px-4 text-[var(--muted)]">invoice_id, raised_by, reason</td>
              <td className="py-3 px-4 text-[var(--muted)]">Dispute initiated</td>
            </tr>
            <tr>
              <td className="py-3 px-4"><code>DisputeResolved</code></td>
              <td className="py-3 px-4 text-[var(--muted)]">invoice_id, resolved_by, outcome</td>
              <td className="py-3 px-4 text-[var(--muted)]">Arbiter resolves</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Gas Costs</h2>
      <p>
        Estimated gas costs on Casper testnet:
      </p>
      <ul>
        <li><strong>Deploy:</strong> ~5-10 CSPR</li>
        <li><strong>Accept:</strong> ~1 CSPR</li>
        <li><strong>Fund:</strong> ~1 CSPR + transfer amount</li>
        <li><strong>Release:</strong> ~1 CSPR</li>
        <li><strong>Cancel/Dispute:</strong> ~1 CSPR</li>
      </ul>

      <h2>Security Considerations</h2>
      <ul>
        <li><strong>Access Control:</strong> Each method validates the caller against stored addresses</li>
        <li><strong>State Guards:</strong> Actions are only allowed in valid states</li>
        <li><strong>Reentrancy:</strong> State updated before external calls</li>
        <li><strong>Integer Overflow:</strong> Using Odra&apos;s safe math operations</li>
      </ul>
    </article>
  );
}
