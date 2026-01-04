/**
 * Deploy Native Escrow Contract to Casper Testnet
 *
 * Usage: npx tsx scripts/deploy-escrow.ts <payer_public_key> <amount_cspr> <description>
 * Example: npx tsx scripts/deploy-escrow.ts 0203abc... 10 "Invoice for services"
 */

import * as fs from 'fs';
import * as path from 'path';
import * as bip39 from 'bip39';
import { HDKey } from '@scure/bip32';
import {
  PrivateKey,
  PublicKey,
  KeyAlgorithm,
  HttpHandler,
  RpcClient,
  Args,
  CLValue,
  Deploy,
  DeployHeader,
  ExecutableDeployItem,
  Duration,
  Timestamp,
} from 'casper-js-sdk';

const TESTNET_RPC = 'https://node.testnet.casper.network/rpc';
const CHAIN_NAME = 'casper-test';
const CASPER_COIN_TYPE = 506;

// Gas cost for contract deployment (100 CSPR)
const DEPLOY_GAS = '100000000000';

/**
 * Derive keys from mnemonic
 */
async function deriveKeysFromMnemonic(mnemonic: string): Promise<PrivateKey> {
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic phrase');
  }

  const seed = await bip39.mnemonicToSeed(mnemonic);
  const hdKey = HDKey.fromMasterSeed(seed);
  const derivationPath = `m/44'/${CASPER_COIN_TYPE}'/0'/0/0`;
  const derived = hdKey.derive(derivationPath);

  if (!derived.privateKey) {
    throw new Error('Failed to derive private key');
  }

  const privateKeyHex = Buffer.from(derived.privateKey).toString('hex');
  return PrivateKey.fromHex(privateKeyHex, KeyAlgorithm.SECP256K1);
}

/**
 * Create RPC client
 */
function createRpcClient(): RpcClient {
  const handler = new HttpHandler(TESTNET_RPC);
  return new RpcClient(handler);
}

/**
 * Wait for deploy confirmation
 */
async function waitForDeployConfirmation(
  client: RpcClient,
  deployHash: string,
  timeoutMs: number = 300000
): Promise<{ success: boolean; contractHash?: string }> {
  const startTime = Date.now();
  console.log('Waiting for deploy confirmation...');
  console.log('Deploy hash:', deployHash);

  while (Date.now() - startTime < timeoutMs) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);

    try {
      const result = await client.getTransactionByDeployHash(deployHash);

      if (result && result.executionInfo) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const executionResult = result.executionInfo.executionResult as any;

        if (executionResult) {
          if (executionResult.errorMessage) {
            console.error(`[${elapsed}s] FAILURE:`, executionResult.errorMessage);
            return { success: false };
          }

          // Check for success indicators
          if (executionResult.effects || executionResult.transfers !== undefined) {
            console.log(`[${elapsed}s] SUCCESS! Contract deployed.`);

            // Try to extract contract hash
            const namedKeys = executionResult.effects?.namedKeys || [];
            for (const key of namedKeys) {
              if (key.name === 'escrow_contract') {
                console.log('Contract hash:', key.key);
                return { success: true, contractHash: key.key };
              }
            }

            return { success: true };
          }
        }
      }

      console.log(`[${elapsed}s] Still processing...`);
    } catch (error) {
      console.log(`[${elapsed}s] Waiting for transaction to appear...`);
    }

    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  console.log('Deploy wait timeout');
  return { success: false };
}

/**
 * Get AccountHash object from public key (for Key CLValue)
 */
function getAccountHash(publicKeyHex: string) {
  const publicKey = PublicKey.fromHex(publicKeyHex);
  return publicKey.accountHash();
}

/**
 * Deploy the escrow contract
 */
async function deployEscrowContract(
  deployerPrivateKey: PrivateKey,
  amountCspr: number,
  description: string
): Promise<string> {
  const client = createRpcClient();

  // Load WASM
  const wasmPath = path.join(__dirname, 'escrow.wasm');
  if (!fs.existsSync(wasmPath)) {
    throw new Error(`WASM file not found at ${wasmPath}`);
  }
  const wasmBytes = new Uint8Array(fs.readFileSync(wasmPath));
  console.log('WASM loaded, size:', wasmBytes.length, 'bytes');

  // Prepare constructor arguments
  const issuerPublicKey = deployerPrivateKey.publicKey;

  // Amount in motes (1 CSPR = 1_000_000_000 motes)
  const amountMotes = BigInt(amountCspr) * BigInt(1_000_000_000);

  console.log('=== DEPLOY PARAMETERS ===');
  console.log('Deployer (issuer/payer):', issuerPublicKey.toHex());
  console.log('Amount:', amountCspr, 'CSPR (', amountMotes.toString(), 'motes)');
  console.log('Description:', description);
  console.log('=========================');

  // Build runtime args - simplified for demo (only amount and description)
  // The contract uses runtime::get_caller() for issuer and payer
  // IMPORTANT: Contract expects u64, not U512!
  const args = Args.fromMap({
    'amount': CLValue.newCLUint64(amountMotes),
    'description': CLValue.newCLString(description),
  });

  // Create session (module bytes with WASM)
  const session = ExecutableDeployItem.newModuleBytes(wasmBytes, args);

  // Create payment
  const payment = ExecutableDeployItem.standardPayment(DEPLOY_GAS);

  // Create deploy header
  const timestamp = new Timestamp(new Date());
  const ttl = new Duration(30 * 60 * 1000); // 30 minutes

  const header = new DeployHeader(
    CHAIN_NAME,
    [],          // dependencies
    1,           // gas price
    timestamp,
    ttl
  );
  header.account = issuerPublicKey;

  // Create deploy using static factory method
  const deploy = Deploy.makeDeploy(header, payment, session);

  // Sign the deploy
  deploy.sign(deployerPrivateKey);

  console.log('Deploy created, hash:', deploy.hash.toHex());

  // Send deploy
  console.log('Sending deploy to network...');
  const result = await client.putDeploy(deploy);
  const deployHash = result.deployHash.toHex();
  console.log('Deploy submitted:', deployHash);

  return deployHash;
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: npx tsx scripts/deploy-escrow.ts <amount_cspr> <description>');
    console.log('Example: npx tsx scripts/deploy-escrow.ts 10 "Invoice for services"');
    process.exit(1);
  }

  const [amountStr, ...descParts] = args;
  const amount = parseInt(amountStr, 10);
  const description = descParts.join(' ');

  if (isNaN(amount) || amount <= 0) {
    console.error('Invalid amount. Please provide a positive number of CSPR.');
    process.exit(1);
  }

  // Load mnemonic from .env.local
  const envPath = path.join(__dirname, '..', '.env.local');
  let mnemonic: string | undefined;

  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/DEMO_PAYER_MNEMONIC="([^"]+)"/);
    if (match) {
      mnemonic = match[1];
    }
  } catch (e) {
    console.error('Failed to read .env.local:', e);
  }

  if (!mnemonic) {
    console.error('DEMO_PAYER_MNEMONIC not found in .env.local');
    process.exit(1);
  }

  try {
    console.log('Deriving deployer keys from mnemonic...');
    const deployerKey = await deriveKeysFromMnemonic(mnemonic);
    console.log('Deployer address:', deployerKey.publicKey.toHex());

    console.log('\nDeploying escrow contract...');
    const deployHash = await deployEscrowContract(
      deployerKey,
      amount,
      description
    );

    console.log('\nDeploy submitted. Waiting for confirmation...');
    console.log('View on explorer: https://testnet.cspr.live/deploy/' + deployHash);

    const client = createRpcClient();
    const result = await waitForDeployConfirmation(client, deployHash);

    if (result.success) {
      console.log('\n=== DEPLOYMENT SUCCESSFUL ===');
      console.log('Deploy hash:', deployHash);
      if (result.contractHash) {
        console.log('Contract hash:', result.contractHash);
      }
      console.log('\nNext steps:');
      console.log('1. The contract is now deployed');
      console.log('2. Use the contract hash to interact with the escrow');
    } else {
      console.error('\n=== DEPLOYMENT FAILED ===');
      process.exit(1);
    }
  } catch (error) {
    console.error('Deployment error:', error);
    process.exit(1);
  }
}

main();
