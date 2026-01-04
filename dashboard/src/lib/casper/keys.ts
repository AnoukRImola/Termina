import * as bip39 from 'bip39';
import { HDKey } from '@scure/bip32';
import {
  PrivateKey,
  PublicKey,
  KeyAlgorithm,
  Deploy,
  HttpHandler,
  RpcClient,
  makeCsprTransferDeploy,
} from 'casper-js-sdk';

// Casper testnet RPC
const TESTNET_RPC = 'https://node.testnet.casper.network/rpc';
const CHAIN_NAME = 'casper-test';

// Casper BIP44 coin type
const CASPER_COIN_TYPE = 506;

/**
 * Derives Secp256k1 private key from a BIP39 mnemonic using BIP44 path
 * Path: m/44'/506'/0'/0/0 (Casper standard)
 */
export async function deriveKeysFromMnemonic(mnemonic: string): Promise<PrivateKey> {
  // Validate mnemonic
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic phrase');
  }

  // Get seed from mnemonic
  const seed = await bip39.mnemonicToSeed(mnemonic);

  // Create HD wallet from seed
  const hdKey = HDKey.fromMasterSeed(seed);

  // Derive using Casper BIP44 path: m/44'/506'/0'/0/0
  const derivationPath = `m/44'/${CASPER_COIN_TYPE}'/0'/0/0`;
  const derived = hdKey.derive(derivationPath);

  if (!derived.privateKey) {
    throw new Error('Failed to derive private key');
  }

  // Convert to hex
  const privateKeyHex = Buffer.from(derived.privateKey).toString('hex');

  // Create Casper private key with Secp256k1 (keys starting with 02)
  const privateKey = PrivateKey.fromHex(privateKeyHex, KeyAlgorithm.SECP256K1);

  return privateKey;
}

/**
 * Create an RPC client for testnet
 */
export function createRpcClient(): RpcClient {
  const handler = new HttpHandler(TESTNET_RPC);
  return new RpcClient(handler);
}

/**
 * Create a native CSPR transfer deploy
 * Using legacy Deploy format for testnet compatibility
 */
export function createTransferDeploy(
  senderPrivateKey: PrivateKey,
  recipientPublicKey: PublicKey,
  amountMotes: string
): Deploy {
  const deploy = makeCsprTransferDeploy({
    senderPublicKeyHex: senderPrivateKey.publicKey.toHex(),
    recipientPublicKeyHex: recipientPublicKey.toHex(),
    transferAmount: amountMotes,
    chainName: CHAIN_NAME,
  });

  console.log('Deploy created, hash:', deploy.hash.toHex());
  return deploy;
}

/**
 * Sign and send a deploy (legacy format for testnet)
 */
export async function signAndSendDeploy(
  deploy: Deploy,
  signerKey: PrivateKey
): Promise<string> {
  const client = createRpcClient();

  // Sign the deploy
  deploy.sign(signerKey);

  console.log('Sending deploy to network...');
  console.log('Deploy approvals:', deploy.approvals.length);

  const result = await client.putDeploy(deploy);
  console.log('Deploy submitted:', result.deployHash.toHex());

  return result.deployHash.toHex();
}

/**
 * Wait for deploy to be processed
 * In Casper 2.0, deploys are converted to transactions, so we use getTransactionByDeployHash
 */
export async function waitForDeployConfirmation(
  deployHash: string,
  timeoutMs: number = 120000
): Promise<boolean> {
  const client = createRpcClient();
  const startTime = Date.now();

  console.log('=== WAITING FOR DEPLOY ===');
  console.log('Deploy hash:', deployHash);
  console.log('Timeout:', timeoutMs / 1000, 'seconds');

  while (Date.now() - startTime < timeoutMs) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);

    try {
      // In Casper 2.0, use getTransactionByDeployHash to check deploy status
      console.log(`[${elapsed}s] Querying transaction status...`);
      const result = await client.getTransactionByDeployHash(deployHash);

      console.log(`[${elapsed}s] Got result, keys:`, result ? Object.keys(result) : 'null');

      // Check if we have execution info
      if (result && result.executionInfo) {
        console.log(`[${elapsed}s] Has executionInfo`);
        const executionResult = result.executionInfo.executionResult;

        if (executionResult) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const resultData = executionResult as any;
          console.log(`[${elapsed}s] ExecutionResult keys:`, Object.keys(resultData));

          // Casper 2.0 format: check for errorMessage and transfers
          if (resultData.errorMessage) {
            console.error(`[${elapsed}s] FAILURE:`, resultData.errorMessage);
            return false;
          }

          // Success if we have transfers and no error
          if (resultData.transfers && resultData.transfers.length > 0) {
            console.log(`[${elapsed}s] SUCCESS! Transfer completed.`);
            console.log(`[${elapsed}s] Transfer amount:`, resultData.transfers[0]?.amount);
            return true;
          }

          // Legacy format fallback
          if (resultData.Version2?.Success || resultData.Success) {
            console.log(`[${elapsed}s] SUCCESS (legacy format)!`);
            return true;
          }
          if (resultData.Version2?.Failure || resultData.Failure) {
            const failure = resultData.Version2?.Failure || resultData.Failure;
            console.error(`[${elapsed}s] FAILURE (legacy):`, JSON.stringify(failure));
            return false;
          }

          console.log(`[${elapsed}s] Waiting for execution to complete...`);
        } else {
          console.log(`[${elapsed}s] No executionResult yet`);
        }
      } else {
        console.log(`[${elapsed}s] No executionInfo yet`);
      }
    } catch (error) {
      // Transaction not found yet, continue waiting
      const err = error as Error;
      console.log(`[${elapsed}s] Query error: ${err.message?.slice(0, 100)}`);
    }

    // Wait 5 seconds before checking again
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  console.log('=== DEPLOY WAIT TIMEOUT ===');
  return false;
}

/**
 * Demo escrow simulation using CSPR transfers
 */
export interface EscrowDemoResult {
  transactions: {
    step: string;
    deployHash: string;
    status: 'pending' | 'success' | 'error';
  }[];
  error?: string;
}

export async function runEscrowDemo(
  issuerAddress: string,
  description: string,
  amountMotes: bigint,
  payerMnemonic: string
): Promise<EscrowDemoResult> {
  const transactions: EscrowDemoResult['transactions'] = [];

  try {
    // Derive payer keys from mnemonic
    const payerPrivateKey = await deriveKeysFromMnemonic(payerMnemonic);
    const payerAddress = payerPrivateKey.publicKey.toHex();

    // Parse issuer public key
    const issuerPublicKey = PublicKey.fromHex(issuerAddress);

    console.log('=== ESCROW DEMO DEBUG ===');
    console.log('Derived payer address:', payerAddress);
    console.log('Expected payer address: 0203ff8cba4d2a6019845d95ade52b110eea6dda8fa28180f234c5def1f2872d7393');
    console.log('Addresses match:', payerAddress.toLowerCase() === '0203ff8cba4d2a6019845d95ade52b110eea6dda8fa28180f234c5def1f2872d7393');
    console.log('Issuer address:', issuerAddress);
    console.log('Amount (motes):', amountMotes.toString());
    console.log('=========================');

    // Casper requires minimum 2.5 CSPR per transfer
    // For demo efficiency, we do a single transfer representing the full escrow flow
    const MIN_TRANSFER = BigInt(2_500_000_000); // 2.5 CSPR minimum
    const transferAmount = amountMotes < MIN_TRANSFER ? MIN_TRANSFER : amountMotes;

    // Single transfer representing the complete escrow cycle:
    // Create -> Accept -> Fund -> Release (all in one on-chain tx)
    console.log('Executing escrow transfer...');
    console.log('Transfer amount:', transferAmount.toString(), 'motes');

    const escrowDeploy = createTransferDeploy(
      payerPrivateKey,
      issuerPublicKey,
      String(transferAmount)
    );
    const deployHash = await signAndSendDeploy(escrowDeploy, payerPrivateKey);

    // Add all steps referencing the same deploy (represents atomic escrow)
    transactions.push(
      { step: 'Escrow Created', deployHash, status: 'pending' },
      { step: 'Terms Accepted', deployHash, status: 'pending' },
      { step: 'Escrow Funded', deployHash, status: 'pending' },
      { step: 'Funds Released', deployHash, status: 'pending' }
    );

    // Wait for the deploy to be processed (extended timeout for testnet)
    const success = await waitForDeployConfirmation(deployHash, 180000);
    const finalStatus = success ? 'success' : 'error';

    // Update all steps with final status
    transactions.forEach(tx => tx.status = finalStatus);

    if (!success) {
      return { transactions, error: 'Failed to execute escrow deploy' };
    }

    console.log('Escrow demo completed successfully!');
    return { transactions };

  } catch (error) {
    console.error('Escrow demo error:', error);
    return {
      transactions,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
