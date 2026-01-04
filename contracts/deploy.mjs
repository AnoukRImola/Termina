#!/usr/bin/env node
/**
 * Deploy Escrow contract to Casper testnet
 * Usage: DEMO_PAYER_MNEMONIC="your mnemonic" node deploy.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as bip39 from 'bip39';
import { HDKey } from '@scure/bip32';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Import casper-js-sdk (CommonJS module)
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const casperSdk = require('casper-js-sdk');

const {
  PrivateKey,
  KeyAlgorithm,
  HttpHandler,
  RpcClient,
  Deploy,
  DeployHeader,
  ExecutableDeployItem,
  ModuleBytes,
  Args,
} = casperSdk;

// Configuration
const TESTNET_RPC = 'https://node.testnet.casper.network/rpc';
const CHAIN_NAME = 'casper-test';
const WASM_PATH = path.join(__dirname, 'wasm', 'Escrow.wasm');

// Gas for deployment (150 CSPR should be enough)
const DEPLOY_GAS = '150000000000';

/**
 * Derive private key from mnemonic
 */
async function deriveKeyFromMnemonic(mnemonic) {
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic phrase');
  }

  const seed = await bip39.mnemonicToSeed(mnemonic);
  const hdKey = HDKey.fromMasterSeed(seed);
  const derived = hdKey.derive("m/44'/506'/0'/0/0");

  if (!derived.privateKey) {
    throw new Error('Failed to derive private key');
  }

  const privateKeyHex = Buffer.from(derived.privateKey).toString('hex');
  return PrivateKey.fromHex(privateKeyHex, KeyAlgorithm.SECP256K1);
}

/**
 * Wait for deploy confirmation
 */
async function waitForDeploy(client, deployHash, timeoutMs = 300000) {
  const startTime = Date.now();
  console.log(`Waiting for deploy: ${deployHash}`);
  console.log(`Timeout: ${timeoutMs / 1000} seconds`);

  while (Date.now() - startTime < timeoutMs) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);

    try {
      const result = await client.getTransactionByDeployHash(deployHash);

      if (result && result.executionInfo) {
        const execResult = result.executionInfo.executionResult;

        if (execResult) {
          // Check for error
          if (execResult.errorMessage) {
            console.error(`[${elapsed}s] Deploy FAILED:`, execResult.errorMessage);
            return { success: false, error: execResult.errorMessage };
          }

          // Check for success (has effects means it executed)
          if (execResult.effects || execResult.transfers) {
            console.log(`[${elapsed}s] Deploy SUCCEEDED!`);
            return { success: true, result: execResult };
          }
        }
      }

      console.log(`[${elapsed}s] Waiting for execution...`);
    } catch (error) {
      console.log(`[${elapsed}s] Deploy not found yet...`);
    }

    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  return { success: false, error: 'Timeout waiting for deploy' };
}

/**
 * Main deploy function
 */
async function deploy() {
  console.log('=== ESCROW CONTRACT DEPLOYMENT ===\n');

  // Check mnemonic
  const mnemonic = process.env.DEMO_PAYER_MNEMONIC;
  if (!mnemonic) {
    console.error('Error: DEMO_PAYER_MNEMONIC environment variable not set');
    console.error('Usage: DEMO_PAYER_MNEMONIC="your mnemonic" node deploy.mjs');
    process.exit(1);
  }

  // Check WASM file
  if (!fs.existsSync(WASM_PATH)) {
    console.error(`Error: WASM file not found at ${WASM_PATH}`);
    console.error('Run: cargo odra build');
    process.exit(1);
  }

  try {
    // Derive keys
    console.log('Deriving keys from mnemonic...');
    const privateKey = await deriveKeyFromMnemonic(mnemonic);
    const publicKey = privateKey.publicKey;
    console.log('Deployer address:', publicKey.toHex());

    // Read WASM
    console.log('\nReading WASM file...');
    const wasmBytes = fs.readFileSync(WASM_PATH);
    console.log('WASM size:', wasmBytes.length, 'bytes');

    // Create RPC client
    const handler = new HttpHandler(TESTNET_RPC);
    const client = new RpcClient(handler);

    // Check balance
    console.log('\nChecking account balance...');
    try {
      const balanceResult = await client.queryLatestBalance(publicKey.toHex());
      const balanceCSPR = Number(balanceResult.balance) / 1_000_000_000;
      console.log('Balance:', balanceCSPR.toFixed(2), 'CSPR');

      if (balanceCSPR < 150) {
        console.error('Warning: Balance may be insufficient for deployment (need ~150 CSPR)');
      }
    } catch (e) {
      console.log('Could not fetch balance, continuing anyway...');
    }

    // Build deploy using makeDeploy helper
    console.log('\nBuilding deployment transaction...');

    // Create module bytes (WASM) - empty args, will call init() separately
    const moduleBytes = new ModuleBytes(wasmBytes, Args.fromMap({}));
    const session = new ExecutableDeployItem();
    session.moduleBytes = moduleBytes;

    // Create payment
    const payment = ExecutableDeployItem.standardPayment(DEPLOY_GAS);

    // Create deploy header
    const deployHeader = DeployHeader.default();
    deployHeader.account = publicKey;
    deployHeader.chainName = CHAIN_NAME;
    // Use default TTL (30 minutes)

    // Create and sign deploy
    const deploy = Deploy.makeDeploy(deployHeader, payment, session);
    deploy.sign(privateKey);

    console.log('Deploy hash:', deploy.hash.toHex());

    // Submit deploy
    console.log('\nSubmitting deploy to network...');
    const putResult = await client.putDeploy(deploy);
    console.log('Deploy submitted:', putResult.deployHash.toHex());

    // Wait for confirmation
    console.log('\nWaiting for deployment confirmation...');
    const confirmation = await waitForDeploy(client, putResult.deployHash.toHex(), 300000);

    if (confirmation.success) {
      console.log('\n=== DEPLOYMENT SUCCESSFUL ===');
      console.log('Deploy hash:', putResult.deployHash.toHex());
      console.log('\nView on explorer:');
      console.log(`https://testnet.cspr.live/deploy/${putResult.deployHash.toHex()}`);

      // Try to extract contract hash from effects
      if (confirmation.result?.effects) {
        console.log('\nNote: Check the deploy on explorer to get the contract hash');
        console.log('Look for "NamedKey" entries in the execution results');
      }
    } else {
      console.error('\n=== DEPLOYMENT FAILED ===');
      console.error('Error:', confirmation.error);
      process.exit(1);
    }

  } catch (error) {
    console.error('\nDeployment error:', error.message);
    if (error.sourceErr) {
      console.error('Details:', JSON.stringify(error.sourceErr, null, 2));
    }
    process.exit(1);
  }
}

deploy();
