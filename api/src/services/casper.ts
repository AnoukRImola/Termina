/**
 * Casper blockchain service
 * Handles all interactions with the Casper network
 */

import { Some, None } from 'ts-results';
import { EscrowState, type EscrowResponse } from '../types/index.js';
import { createRequire } from 'module';

// ============================================
// IN-MEMORY STORE FOR DEMO MODE
// ============================================

interface StoredEscrow {
  contractAddress: string;
  state: EscrowState;
  invoice: {
    id: string;
    description: string;
    amount: number;
    issuerAddress: string;
    payerAddress: string;
    arbiterAddress?: string;
    createdAt: string;
    dueDate?: string;
  };
  balance: number;
  disputeReason?: string;
}

// In-memory store for demo escrows
const demoEscrowStore = new Map<string, StoredEscrow>();

// Helper to get all demo escrows
export function getAllDemoEscrows(): StoredEscrow[] {
  return Array.from(demoEscrowStore.values());
}

// Helper to clear demo store (useful for testing)
export function clearDemoStore(): void {
  demoEscrowStore.clear();
}

// casper-js-sdk is CJS, use require for ESM compatibility
const require = createRequire(import.meta.url);
const casperSdk = require('casper-js-sdk');

const CasperClient = casperSdk.CasperClient as typeof import('casper-js-sdk').CasperClient;
const Contracts = casperSdk.Contracts as typeof import('casper-js-sdk').Contracts;
const RuntimeArgs = casperSdk.RuntimeArgs as typeof import('casper-js-sdk').RuntimeArgs;
const CLValueBuilder = casperSdk.CLValueBuilder as typeof import('casper-js-sdk').CLValueBuilder;
const CLPublicKey = casperSdk.CLPublicKey as typeof import('casper-js-sdk').CLPublicKey;
const DeployUtil = casperSdk.DeployUtil as typeof import('casper-js-sdk').DeployUtil;
const CLOption = casperSdk.CLOption;
const CLKeyType = casperSdk.CLKeyType;
const CLU64Type = casperSdk.CLU64Type;

// Configuration
const CASPER_NODE_URL = process.env.CASPER_NODE_URL || 'https://rpc.testnet.casperlabs.io/rpc';
const NETWORK_NAME = process.env.CASPER_NETWORK || 'casper-test';
const ESCROW_CONTRACT_HASH = process.env.ESCROW_CONTRACT_HASH || '';

// Gas costs (in motes, 1 CSPR = 1,000,000,000 motes)
const GAS_PAYMENT = {
  DEPLOY: '50000000000',    // 50 CSPR for contract deployment
  CALL: '5000000000',       // 5 CSPR for entry point calls
};

export class CasperService {
  private client: InstanceType<typeof CasperClient>;
  private networkName: string;
  private contract: InstanceType<typeof Contracts.Contract>;

  constructor() {
    this.client = new CasperClient(CASPER_NODE_URL);
    this.networkName = NETWORK_NAME;
    this.contract = new Contracts.Contract(this.client);

    if (ESCROW_CONTRACT_HASH) {
      this.contract.setContractHash(ESCROW_CONTRACT_HASH);
    }
  }

  /**
   * Set the contract hash for the escrow contract
   */
  setContractHash(hash: string) {
    this.contract.setContractHash(hash);
  }

  // ============================================
  // DEMO/SIMPLE API (for hackathon testing)
  // These methods simulate blockchain interactions
  // ============================================

  /**
   * Deploy a new escrow contract (demo mode)
   */
  async deployEscrow(params: {
    id: string;
    description: string;
    amount: number;
    issuerAddress: string;
    payerAddress: string;
    arbiterAddress?: string;
    dueDate?: string;
  }): Promise<{ deployHash: string; contractAddress: string }> {
    console.log('Deploying escrow contract:', params);

    // For demo: generate mock hashes
    const deployHash = `deploy-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const contractAddress = `hash-${params.id.toLowerCase()}-${Math.random().toString(36).slice(2)}`;

    // Store the escrow in memory
    const escrow: StoredEscrow = {
      contractAddress,
      state: EscrowState.Draft,
      invoice: {
        id: params.id,
        description: params.description,
        amount: params.amount,
        issuerAddress: params.issuerAddress,
        payerAddress: params.payerAddress,
        arbiterAddress: params.arbiterAddress,
        createdAt: new Date().toISOString(),
        dueDate: params.dueDate,
      },
      balance: 0,
    };
    demoEscrowStore.set(contractAddress, escrow);
    console.log('Stored demo escrow:', contractAddress);

    return { deployHash, contractAddress };
  }

  /**
   * Get escrow state (demo mode with fallback to real query)
   */
  async getEscrow(contractAddress: string): Promise<EscrowResponse | null> {
    // Check demo store first
    const demoEscrow = demoEscrowStore.get(contractAddress);
    if (demoEscrow) {
      console.log('Found escrow in demo store:', contractAddress);
      return {
        contractAddress: demoEscrow.contractAddress,
        state: demoEscrow.state,
        invoice: {
          id: demoEscrow.invoice.id,
          description: demoEscrow.invoice.description,
          amount: demoEscrow.invoice.amount,
          issuerAddress: demoEscrow.invoice.issuerAddress,
          payerAddress: demoEscrow.invoice.payerAddress,
          createdAt: demoEscrow.invoice.createdAt,
        },
        balance: demoEscrow.balance,
      };
    }

    // Try real query if contract hash looks valid
    if (contractAddress.startsWith('hash-')) {
      try {
        return await this.queryEscrowOnChain(contractAddress);
      } catch (error) {
        console.log('On-chain query failed:', error);
      }
    }

    // Escrow not found
    return null;
  }

  /**
   * Accept escrow (demo mode)
   * Transitions: Draft -> Accepted
   */
  async acceptEscrow(
    contractAddress: string,
    payerKey: string
  ): Promise<{ deployHash: string }> {
    console.log('Accepting escrow:', contractAddress);

    const escrow = demoEscrowStore.get(contractAddress);
    if (escrow) {
      if (escrow.state !== EscrowState.Draft) {
        throw new Error(`Cannot accept escrow in state: ${escrow.state}`);
      }
      escrow.state = EscrowState.Accepted;
      demoEscrowStore.set(contractAddress, escrow);
      console.log('Escrow accepted, new state:', escrow.state);
    }

    return { deployHash: `deploy-accept-${Date.now()}` };
  }

  /**
   * Fund escrow (demo mode)
   * Transitions: Accepted -> Funded
   */
  async fundEscrow(
    contractAddress: string,
    amount: number,
    payerKey: string
  ): Promise<{ deployHash: string }> {
    console.log('Funding escrow:', contractAddress, amount);

    const escrow = demoEscrowStore.get(contractAddress);
    if (escrow) {
      if (escrow.state !== EscrowState.Accepted) {
        throw new Error(`Cannot fund escrow in state: ${escrow.state}`);
      }
      escrow.state = EscrowState.Funded;
      escrow.balance = amount;
      demoEscrowStore.set(contractAddress, escrow);
      console.log('Escrow funded, balance:', escrow.balance);
    }

    return { deployHash: `deploy-fund-${Date.now()}` };
  }

  /**
   * Release escrow (demo mode)
   * Transitions: Funded -> Released
   */
  async releaseEscrow(
    contractAddress: string,
    payerKey: string
  ): Promise<{ deployHash: string }> {
    console.log('Releasing escrow:', contractAddress);

    const escrow = demoEscrowStore.get(contractAddress);
    if (escrow) {
      if (escrow.state !== EscrowState.Funded) {
        throw new Error(`Cannot release escrow in state: ${escrow.state}`);
      }
      escrow.state = EscrowState.Released;
      escrow.balance = 0;
      demoEscrowStore.set(contractAddress, escrow);
      console.log('Escrow released');
    }

    return { deployHash: `deploy-release-${Date.now()}` };
  }

  /**
   * Cancel escrow (demo mode)
   * Transitions: Draft|Accepted -> Cancelled
   */
  async cancelEscrow(
    contractAddress: string,
    callerKey: string
  ): Promise<{ deployHash: string }> {
    console.log('Cancelling escrow:', contractAddress);

    const escrow = demoEscrowStore.get(contractAddress);
    if (escrow) {
      if (escrow.state !== EscrowState.Draft && escrow.state !== EscrowState.Accepted) {
        throw new Error(`Cannot cancel escrow in state: ${escrow.state}`);
      }
      escrow.state = EscrowState.Cancelled;
      demoEscrowStore.set(contractAddress, escrow);
      console.log('Escrow cancelled');
    }

    return { deployHash: `deploy-cancel-${Date.now()}` };
  }

  /**
   * Dispute escrow (demo mode)
   * Transitions: Funded -> Disputed
   */
  async disputeEscrow(
    contractAddress: string,
    reason: string,
    callerKey: string
  ): Promise<{ deployHash: string }> {
    console.log('Disputing escrow:', contractAddress, reason);

    const escrow = demoEscrowStore.get(contractAddress);
    if (escrow) {
      if (escrow.state !== EscrowState.Funded) {
        throw new Error(`Cannot dispute escrow in state: ${escrow.state}`);
      }
      escrow.state = EscrowState.Disputed;
      escrow.disputeReason = reason;
      demoEscrowStore.set(contractAddress, escrow);
      console.log('Escrow disputed, reason:', reason);
    }

    return { deployHash: `deploy-dispute-${Date.now()}` };
  }

  /**
   * Resolve dispute (demo mode)
   * Transitions: Disputed -> Released (if releaseToReceiver) or Cancelled (refund)
   */
  async resolveDispute(
    contractAddress: string,
    releaseToReceiver: boolean,
    arbiterKey: string
  ): Promise<{ deployHash: string }> {
    console.log('Resolving dispute:', contractAddress, releaseToReceiver);

    const escrow = demoEscrowStore.get(contractAddress);
    if (escrow) {
      if (escrow.state !== EscrowState.Disputed) {
        throw new Error(`Cannot resolve escrow in state: ${escrow.state}`);
      }
      escrow.state = releaseToReceiver ? EscrowState.Released : EscrowState.Cancelled;
      escrow.balance = 0;
      demoEscrowStore.set(contractAddress, escrow);
      console.log('Dispute resolved, new state:', escrow.state);
    }

    return { deployHash: `deploy-resolve-${Date.now()}` };
  }

  // ============================================
  // PRODUCTION API (for wallet-signed deploys)
  // These methods build deploys for frontend signing
  // ============================================

  /**
   * Build a deploy to initialize a new escrow
   * Returns unsigned deploy JSON for frontend to sign
   */
  async buildInitEscrowDeploy(params: {
    id: string;
    description: string;
    amount: number;
    issuerPublicKey: string;
    payerPublicKey: string;
    arbiterPublicKey?: string;
    dueDate?: number;
    contractWasm?: Uint8Array;
  }): Promise<{ deployJson: string }> {
    const senderKey = CLPublicKey.fromHex(params.issuerPublicKey);
    const payerKey = CLPublicKey.fromHex(params.payerPublicKey);

    // Build arguments
    const args = RuntimeArgs.fromMap({
      'id': CLValueBuilder.string(params.id),
      'description': CLValueBuilder.string(params.description),
      'amount': CLValueBuilder.u64(params.amount),
      'payer': CLValueBuilder.key(payerKey),
      'arbiter': params.arbiterPublicKey
        ? new CLOption(Some(CLValueBuilder.key(CLPublicKey.fromHex(params.arbiterPublicKey))))
        : new CLOption(None, new CLKeyType()),
      'due_date': params.dueDate
        ? new CLOption(Some(CLValueBuilder.u64(params.dueDate)))
        : new CLOption(None, new CLU64Type()),
    });

    let deploy: ReturnType<typeof DeployUtil.makeDeploy>;

    if (params.contractWasm) {
      deploy = this.contract.install(
        params.contractWasm,
        args,
        GAS_PAYMENT.DEPLOY,
        senderKey,
        this.networkName
      );
    } else {
      deploy = this.contract.callEntrypoint(
        'init',
        args,
        senderKey,
        this.networkName,
        GAS_PAYMENT.CALL
      );
    }

    return {
      deployJson: JSON.stringify(DeployUtil.deployToJson(deploy)),
    };
  }

  /**
   * Build a deploy to accept an escrow
   */
  async buildAcceptDeploy(params: {
    contractHash: string;
    payerPublicKey: string;
  }): Promise<{ deployJson: string }> {
    const contract = new Contracts.Contract(this.client);
    contract.setContractHash(params.contractHash);

    const senderKey = CLPublicKey.fromHex(params.payerPublicKey);
    const args = RuntimeArgs.fromMap({});

    const deploy = contract.callEntrypoint(
      'accept',
      args,
      senderKey,
      this.networkName,
      GAS_PAYMENT.CALL
    );

    return {
      deployJson: JSON.stringify(DeployUtil.deployToJson(deploy)),
    };
  }

  /**
   * Build a deploy to fund an escrow
   */
  async buildFundDeploy(params: {
    contractHash: string;
    amount: number;
    payerPublicKey: string;
  }): Promise<{ deployJson: string }> {
    const contract = new Contracts.Contract(this.client);
    contract.setContractHash(params.contractHash);

    const senderKey = CLPublicKey.fromHex(params.payerPublicKey);
    const args = RuntimeArgs.fromMap({
      'amount': CLValueBuilder.u64(params.amount),
    });

    const deploy = contract.callEntrypoint(
      'fund',
      args,
      senderKey,
      this.networkName,
      GAS_PAYMENT.CALL
    );

    return {
      deployJson: JSON.stringify(DeployUtil.deployToJson(deploy)),
    };
  }

  /**
   * Build a deploy to release funds
   */
  async buildReleaseDeploy(params: {
    contractHash: string;
    payerPublicKey: string;
  }): Promise<{ deployJson: string }> {
    const contract = new Contracts.Contract(this.client);
    contract.setContractHash(params.contractHash);

    const senderKey = CLPublicKey.fromHex(params.payerPublicKey);
    const args = RuntimeArgs.fromMap({});

    const deploy = contract.callEntrypoint(
      'release',
      args,
      senderKey,
      this.networkName,
      GAS_PAYMENT.CALL
    );

    return {
      deployJson: JSON.stringify(DeployUtil.deployToJson(deploy)),
    };
  }

  /**
   * Submit a signed deploy to the network
   */
  async submitDeploy(signedDeployJson: string): Promise<{ deployHash: string }> {
    const deploy = DeployUtil.deployFromJson(JSON.parse(signedDeployJson));

    if (deploy.err) {
      throw new Error(`Invalid deploy: ${deploy.err}`);
    }

    const deployHash = await this.client.putDeploy(deploy.val!);

    return { deployHash };
  }

  /**
   * Query escrow state from the blockchain
   */
  private async queryEscrowOnChain(contractHash: string): Promise<EscrowResponse | null> {
    const contract = new Contracts.Contract(this.client);
    contract.setContractHash(contractHash);

    const stateResult = await contract.queryContractData(['state']);
    const invoiceResult = await contract.queryContractData(['invoice']);
    const balanceResult = await contract.queryContractData(['balance']);

    const stateValue = this.parseEscrowState(stateResult);

    return {
      contractAddress: contractHash,
      state: stateValue,
      invoice: {
        id: invoiceResult?.id || '',
        description: invoiceResult?.description || '',
        amount: Number(invoiceResult?.amount || 0),
        issuerAddress: invoiceResult?.issuer || '',
        payerAddress: invoiceResult?.payer || '',
        createdAt: new Date(Number(invoiceResult?.created_at || 0)).toISOString(),
      },
      balance: Number(balanceResult || 0),
    };
  }

  /**
   * Wait for a deploy to be processed
   */
  async waitForDeploy(deployHash: string, timeoutMs: number = 120000): Promise<{
    success: boolean;
    executionResult?: any;
    errorMessage?: string;
  }> {
    const startTime = Date.now();
    const pollInterval = 5000;

    while (Date.now() - startTime < timeoutMs) {
      try {
        const [, deployResult] = await this.client.getDeploy(deployHash);

        if (deployResult?.execution_results?.length > 0) {
          const executionResult = deployResult.execution_results[0];

          if ('Success' in executionResult.result) {
            return {
              success: true,
              executionResult: executionResult.result.Success,
            };
          } else if ('Failure' in executionResult.result) {
            return {
              success: false,
              errorMessage: executionResult.result.Failure?.error_message || 'Unknown error',
            };
          }
        }
      } catch (error) {
        // Deploy not found yet, continue polling
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    return {
      success: false,
      errorMessage: 'Deploy execution timed out',
    };
  }

  /**
   * Get deploy status
   */
  async getDeployStatus(deployHash: string): Promise<{
    found: boolean;
    executed: boolean;
    success?: boolean;
    errorMessage?: string;
  }> {
    try {
      const [, deployResult] = await this.client.getDeploy(deployHash);

      if (!deployResult) {
        return { found: false, executed: false };
      }

      if (!deployResult.execution_results?.length) {
        return { found: true, executed: false };
      }

      const executionResult = deployResult.execution_results[0];

      if ('Success' in executionResult.result) {
        return { found: true, executed: true, success: true };
      } else {
        return {
          found: true,
          executed: true,
          success: false,
          errorMessage: executionResult.result.Failure?.error_message || 'Unknown error',
        };
      }
    } catch (error) {
      return { found: false, executed: false };
    }
  }

  /**
   * Parse escrow state from contract value
   */
  private parseEscrowState(value: any): EscrowState {
    const stateMap: Record<number, EscrowState> = {
      0: EscrowState.Draft,
      1: EscrowState.Accepted,
      2: EscrowState.Funded,
      3: EscrowState.Released,
      4: EscrowState.Cancelled,
      5: EscrowState.Disputed,
    };

    const stateNum = typeof value === 'number' ? value : Number(value);
    return stateMap[stateNum] || EscrowState.Draft;
  }

  /**
   * Get account balance
   */
  async getAccountBalance(publicKeyHex: string): Promise<string> {
    try {
      const publicKey = CLPublicKey.fromHex(publicKeyHex);
      const balance = await this.client.balanceOfByPublicKey(publicKey);
      return balance.toString();
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  }
}

// Singleton instance
export const casperService = new CasperService();
