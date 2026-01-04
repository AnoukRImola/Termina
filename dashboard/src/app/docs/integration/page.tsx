export default function Integration() {
  return (
    <article className="prose animate-fade-in">
      <h1>Integration Guide</h1>
      <p>
        Integrate Términa Escrow into your application using our TypeScript SDK or direct
        smart contract calls. This guide covers everything you need to get started.
      </p>

      <h2 id="quick-start">Quick Start</h2>
      <p>
        The fastest way to integrate escrow functionality into your app:
      </p>

      <h3>1. Install Dependencies</h3>
      <pre><code>{`npm install casper-js-sdk
# or
yarn add casper-js-sdk`}</code></pre>

      <h3>2. Initialize the SDK</h3>
      <pre><code>{`import { CasperClient, Keys, DeployUtil } from 'casper-js-sdk';

// Connect to Casper network
const client = new CasperClient('https://rpc.testnet.casperlabs.io/rpc');

// Load your keys
const keys = Keys.Ed25519.loadKeyPairFromPrivateFile('./secret_key.pem');`}</code></pre>

      <h3>3. Create an Escrow</h3>
      <pre><code>{`// Deploy escrow contract with invoice details
const deploy = DeployUtil.makeDeploy(
  new DeployUtil.DeployParams(
    keys.publicKey,
    'casper-test',
    1,
    1800000 // 30 min TTL
  ),
  DeployUtil.ExecutableDeployItem.newModuleBytes(
    escrowWasm,
    RuntimeArgs.fromMap({
      invoice_id: CLValueBuilder.string('INV-001'),
      description: CLValueBuilder.string('Web development'),
      amount: CLValueBuilder.u512(100_000_000_000), // 100 CSPR
      payer: CLValueBuilder.key(payerPublicKey),
      arbiter: CLValueBuilder.option(Some(arbiterPublicKey))
    })
  ),
  DeployUtil.standardPayment(50_000_000_000) // 50 CSPR gas
);

// Sign and send
const signedDeploy = DeployUtil.signDeploy(deploy, keys);
const result = await client.putDeploy(signedDeploy);
console.log('Deploy hash:', result);`}</code></pre>

      <h2 id="api-reference">API Reference</h2>
      <p>
        The escrow contract exposes the following entry points. All methods require proper
        authentication and state validation.
      </p>

      <div className="not-prose overflow-x-auto my-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left py-3 px-4 font-semibold text-[var(--casper-dark)]">Method</th>
              <th className="text-left py-3 px-4 font-semibold text-[var(--casper-dark)]">Parameters</th>
              <th className="text-left py-3 px-4 font-semibold text-[var(--casper-dark)]">Caller</th>
              <th className="text-left py-3 px-4 font-semibold text-[var(--casper-dark)]">Gas (CSPR)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 px-4"><code>init</code></td>
              <td className="py-3 px-4 text-[var(--muted)]">EscrowConfig</td>
              <td className="py-3 px-4 text-[var(--muted)]">Issuer</td>
              <td className="py-3 px-4 text-[var(--muted)]">~50</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 px-4"><code>accept</code></td>
              <td className="py-3 px-4 text-[var(--muted)]">none</td>
              <td className="py-3 px-4 text-[var(--muted)]">Payer</td>
              <td className="py-3 px-4 text-[var(--muted)]">~1</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 px-4"><code>fund</code></td>
              <td className="py-3 px-4 text-[var(--muted)]">amount (attached)</td>
              <td className="py-3 px-4 text-[var(--muted)]">Payer</td>
              <td className="py-3 px-4 text-[var(--muted)]">~1 + amount</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 px-4"><code>release</code></td>
              <td className="py-3 px-4 text-[var(--muted)]">none</td>
              <td className="py-3 px-4 text-[var(--muted)]">Payer</td>
              <td className="py-3 px-4 text-[var(--muted)]">~1</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 px-4"><code>cancel</code></td>
              <td className="py-3 px-4 text-[var(--muted)]">none</td>
              <td className="py-3 px-4 text-[var(--muted)]">Issuer/Payer</td>
              <td className="py-3 px-4 text-[var(--muted)]">~1</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 px-4"><code>dispute</code></td>
              <td className="py-3 px-4 text-[var(--muted)]">reason: String</td>
              <td className="py-3 px-4 text-[var(--muted)]">Issuer/Payer</td>
              <td className="py-3 px-4 text-[var(--muted)]">~1</td>
            </tr>
            <tr>
              <td className="py-3 px-4"><code>resolve_dispute</code></td>
              <td className="py-3 px-4 text-[var(--muted)]">release_to_issuer: bool</td>
              <td className="py-3 px-4 text-[var(--muted)]">Arbiter</td>
              <td className="py-3 px-4 text-[var(--muted)]">~1</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="calling-methods">Calling Contract Methods</h2>
      <p>
        After deployment, interact with the escrow using stored contract calls:
      </p>

      <h3>Accept Escrow (Payer)</h3>
      <pre><code>{`const deploy = DeployUtil.makeDeploy(
  deployParams,
  DeployUtil.ExecutableDeployItem.newStoredContractByHash(
    escrowContractHash,
    'accept',
    RuntimeArgs.fromMap({})
  ),
  DeployUtil.standardPayment(1_000_000_000) // 1 CSPR
);`}</code></pre>

      <h3>Fund Escrow (Payer)</h3>
      <pre><code>{`const deploy = DeployUtil.makeDeploy(
  deployParams,
  DeployUtil.ExecutableDeployItem.newStoredContractByHash(
    escrowContractHash,
    'fund',
    RuntimeArgs.fromMap({
      amount: CLValueBuilder.u512(100_000_000_000) // 100 CSPR
    })
  ),
  DeployUtil.standardPayment(101_000_000_000) // amount + gas
);`}</code></pre>

      <h3>Release Funds (Payer)</h3>
      <pre><code>{`const deploy = DeployUtil.makeDeploy(
  deployParams,
  DeployUtil.ExecutableDeployItem.newStoredContractByHash(
    escrowContractHash,
    'release',
    RuntimeArgs.fromMap({})
  ),
  DeployUtil.standardPayment(1_000_000_000) // 1 CSPR
);`}</code></pre>

      <h2 id="querying-state">Querying State</h2>
      <p>
        Read escrow data using the Casper RPC:
      </p>
      <pre><code>{`// Get current state
const stateRootHash = await client.nodeClient.getStateRootHash();
const state = await client.nodeClient.getBlockState(
  stateRootHash,
  \`hash-\${escrowContractHash}\`,
  ['state']
);
console.log('Escrow state:', state);

// Get invoice details
const invoice = await client.nodeClient.getBlockState(
  stateRootHash,
  \`hash-\${escrowContractHash}\`,
  ['invoice']
);
console.log('Invoice:', invoice);`}</code></pre>

      <h2 id="events">Listening to Events</h2>
      <p>
        Subscribe to escrow events using the Casper Event Stream:
      </p>
      <pre><code>{`import { EventStream, EventName } from 'casper-js-sdk';

const eventStream = new EventStream(
  'https://events.testnet.casperlabs.io/events/main'
);

eventStream.subscribe(EventName.DeployProcessed, (event) => {
  const deploy = event.body.DeployProcessed;

  // Filter for your escrow contract
  if (deploy.execution_result.Success) {
    const transforms = deploy.execution_result.Success.effect.transforms;
    // Parse event data from transforms
    console.log('Escrow event:', transforms);
  }
});

eventStream.start();`}</code></pre>

      <h2 id="error-handling">Error Handling</h2>
      <p>
        The contract returns specific error codes for different failure scenarios:
      </p>
      <div className="not-prose overflow-x-auto my-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left py-3 px-4 font-semibold text-[var(--casper-dark)]">Code</th>
              <th className="text-left py-3 px-4 font-semibold text-[var(--casper-dark)]">Error</th>
              <th className="text-left py-3 px-4 font-semibold text-[var(--casper-dark)]">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 px-4"><code>1</code></td>
              <td className="py-3 px-4 text-[var(--muted)]">NotPayer</td>
              <td className="py-3 px-4 text-[var(--muted)]">Caller is not the designated payer</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 px-4"><code>2</code></td>
              <td className="py-3 px-4 text-[var(--muted)]">NotIssuer</td>
              <td className="py-3 px-4 text-[var(--muted)]">Caller is not the designated issuer</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 px-4"><code>3</code></td>
              <td className="py-3 px-4 text-[var(--muted)]">NotArbiter</td>
              <td className="py-3 px-4 text-[var(--muted)]">Caller is not the designated arbiter</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 px-4"><code>4</code></td>
              <td className="py-3 px-4 text-[var(--muted)]">InvalidState</td>
              <td className="py-3 px-4 text-[var(--muted)]">Action not allowed in current state</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3 px-4"><code>5</code></td>
              <td className="py-3 px-4 text-[var(--muted)]">InsufficientFunds</td>
              <td className="py-3 px-4 text-[var(--muted)]">Deposit less than invoice amount</td>
            </tr>
            <tr>
              <td className="py-3 px-4"><code>6</code></td>
              <td className="py-3 px-4 text-[var(--muted)]">NoArbiter</td>
              <td className="py-3 px-4 text-[var(--muted)]">No arbiter set for dispute resolution</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Testnet Resources</h2>
      <ul>
        <li>
          <strong>RPC Endpoint:</strong>{' '}
          <code>https://rpc.testnet.casperlabs.io/rpc</code>
        </li>
        <li>
          <strong>Event Stream:</strong>{' '}
          <code>https://events.testnet.casperlabs.io/events/main</code>
        </li>
        <li>
          <strong>Explorer:</strong>{' '}
          <a href="https://testnet.cspr.live" target="_blank" rel="noopener noreferrer">
            testnet.cspr.live
          </a>
        </li>
        <li>
          <strong>Faucet:</strong>{' '}
          <a href="https://testnet.cspr.live/tools/faucet" target="_blank" rel="noopener noreferrer">
            Get testnet CSPR
          </a>
        </li>
      </ul>
    </article>
  );
}
