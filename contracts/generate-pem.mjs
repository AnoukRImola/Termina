#!/usr/bin/env node
/**
 * Generate PEM file from BIP39 mnemonic for Casper Secp256k1
 */

import fs from 'fs';
import * as bip39 from 'bip39';
import { HDKey } from '@scure/bip32';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const KeyEncoder = require('key-encoder').default;

const mnemonic = process.env.DEMO_PAYER_MNEMONIC;

if (!mnemonic) {
  console.error('Error: DEMO_PAYER_MNEMONIC not set');
  process.exit(1);
}

if (!bip39.validateMnemonic(mnemonic)) {
  console.error('Error: Invalid mnemonic');
  process.exit(1);
}

async function main() {
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const hdKey = HDKey.fromMasterSeed(seed);
  const derived = hdKey.derive("m/44'/506'/0'/0/0");

  if (!derived.privateKey) {
    console.error('Failed to derive private key');
    process.exit(1);
  }

  const privateKeyHex = Buffer.from(derived.privateKey).toString('hex');
  const publicKeyHex = Buffer.from(derived.publicKey).toString('hex');

  // Use key-encoder to create proper PEM format for Secp256k1
  const keyEncoder = new KeyEncoder('secp256k1');
  const pemContent = keyEncoder.encodePrivate(privateKeyHex, 'raw', 'pem');

  fs.writeFileSync('.keys/secret_key.pem', pemContent);

  console.log('PEM file generated at .keys/secret_key.pem');
  console.log('Public key (Casper format):', '02' + publicKeyHex);
}

main();
