/**
 * Test deploy with a single u64 argument
 * This tests if casper-js-sdk 5.x serialization is compatible with casper-contract 3.x
 */

import * as fs from 'fs';
import * as path from 'path';
import * as bip39 from 'bip39';
import { HDKey } from '@scure/bip32';
import {
  PrivateKey,
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
const DEPLOY_GAS = '50000000000'; // 50 CSPR

async function deriveKeysFromMnemonic(mnemonic: string): Promise<PrivateKey> {
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const hdKey = HDKey.fromMasterSeed(seed);
  const derived = hdKey.derive(`m/44'/${CASPER_COIN_TYPE}'/0'/0/0`);
  const privateKeyHex = Buffer.from(derived.privateKey!).toString('hex');
  return PrivateKey.fromHex(privateKeyHex, KeyAlgorithm.SECP256K1);
}

async function waitForDeploy(client: RpcClient, deployHash: string, timeoutMs = 180000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    try {
      const result = await client.getTransactionByDeployHash(deployHash);
      if (result?.executionInfo?.executionResult) {
        const execResult = result.executionInfo.executionResult as any;
        if (execResult.errorMessage) {
          console.log(`[${elapsed}s] FAILURE:`, execResult.errorMessage);
          return false;
        }
        if (execResult.effects || execResult.transfers !== undefined) {
          console.log(`[${elapsed}s] SUCCESS!`);
          return true;
        }
      }
      console.log(`[${elapsed}s] Processing...`);
    } catch {
      console.log(`[${elapsed}s] Waiting...`);
    }
    await new Promise(r => setTimeout(r, 5000));
  }
  return false;
}

async function main() {
  // Load mnemonic
  const envPath = path.join(__dirname, '..', '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/DEMO_PAYER_MNEMONIC="([^"]+)"/);
  if (!match) throw new Error('DEMO_PAYER_MNEMONIC not found');

  const deployerKey = await deriveKeysFromMnemonic(match[1]);
  console.log('Deployer:', deployerKey.publicKey.toHex());

  // Load test_args.wasm
  const wasmPath = path.join(__dirname, 'test_args.wasm');
  const wasmBytes = new Uint8Array(fs.readFileSync(wasmPath));
  console.log('WASM size:', wasmBytes.length, 'bytes');

  // Create args with ONLY u64
  const testAmount = 123456789n;
  console.log('\n=== Testing u64 argument ===');
  console.log('Value:', testAmount);

  const args = Args.fromMap({
    'amount': CLValue.newCLUint64(testAmount),
  });

  // Log the serialized bytes for debugging
  const argsBytes = args.toBytes();
  console.log('Args bytes:', Buffer.from(argsBytes).toString('hex'));

  // Create deploy
  const session = ExecutableDeployItem.newModuleBytes(wasmBytes, args);
  const payment = ExecutableDeployItem.standardPayment(DEPLOY_GAS);

  const header = new DeployHeader(
    CHAIN_NAME,
    [],
    1,
    new Timestamp(new Date()),
    new Duration(30 * 60 * 1000)
  );
  header.account = deployerKey.publicKey;

  const deploy = Deploy.makeDeploy(header, payment, session);
  deploy.sign(deployerKey);

  console.log('\nDeploy hash:', deploy.hash.toHex());

  // Send deploy
  const client = new RpcClient(new HttpHandler(TESTNET_RPC));
  console.log('Sending to network...');
  const result = await client.putDeploy(deploy);
  console.log('Submitted:', result.deployHash.toHex());
  console.log('Explorer: https://testnet.cspr.live/deploy/' + result.deployHash.toHex());

  // Wait for result
  const success = await waitForDeploy(client, result.deployHash.toHex());
  console.log(success ? '\n=== TEST PASSED ===' : '\n=== TEST FAILED ===');
}

main().catch(console.error);
