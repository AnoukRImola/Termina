/**
 * Casper blockchain service
 * Handles all interactions with the Casper network
 */

import {
  CasperClient,
  Contracts,
  RuntimeArgs,
  CLValueBuilder,
  CLPublicKey,
  DeployUtil,
  CLOption,
  Keys,
} from 'casper-js-sdk';
import { Some, None } from 'ts-results';
import { EscrowState, type EscrowResponse } from '../types/index.js';

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
  private client: CasperClient;
  private networkName: string;
  private contract: Contracts.Contract;

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

    return { deployHash, contractAddress };
  }

  /**
   * Get escrow state (demo mode with fallback to real query)
   */
  async getEscrow(contractAddress: string): Promise<EscrowResponse | null> {
    // Try real query first if contract hash is valid
    if (contractAddress.startsWith('hash-')) {
      try {
        return await this.queryEscrowOnChain(contractAddress);
      } catch (error) {
        console.log('On-chain query failed, using demo data:', error);
      }
    }

    // Fallback to demo data
    return {
      contractAddress,
      state: EscrowState.Draft,
      invoice: {
        id: 'INV-001',
        description: 'Demo invoice',
        amount: 1000,
        issuerAddress: 'account-hash-issuer',
        payerAddress: 'account-hash-payer',
        createdAt: new Date().toISOString(),
      },
      balance: 0,
    };
  }

  /**
   * Accept escrow (demo mode)
   */
  async acceptEscrow(
    contractAddress: string,
    payerKey: string
  ): Promise<{ deployHash: string }> {
    console.log('Accepting escrow:', contractAddress);
    return { deployHash: `deploy-accept-${Date.now()}` };
  }

  /**
   * Fund escrow (demo mode)
   */
  async fundEscrow(
    contractAddress: string,
    amount: number,
    payerKey: string
  ): Promise<{ deployHash: string }> {
    console.log('Funding escrow:', contractAddress, amount);
    return { deployHash: `deploy-fund-${Date.now()}` };
  }

  /**
   * Release escrow (demo mode)
   */
  async releaseEscrow(
    contractAddress: string,
    payerKey: string
  ): Promise<{ deployHash: string }> {
    console.log('Releasing escrow:', contractAddress);
    return { deployHash: `deploy-release-${Date.now()}` };
  }

  /**
   * Cancel escrow (demo mode)
   */
  async cancelEscrow(
    contractAddress: string,
    callerKey: string
  ): Promise<{ deployHash: string }> {
    console.log('Cancelling escrow:', contractAddress);
    return { deployHash: `deploy-cancel-${Date.now()}` };
  }

  /**
   * Dispute escrow (demo mode)
   */
  async disputeEscrow(
    contractAddress: string,
    reason: string,
    callerKey: string
  ): Promise<{ deployHash: string }> {
    console.log('Disputing escrow:', contractAddress, reason);
    return { deployHash: `deploy-dispute-${Date.now()}` };
  }

  /**
   * Resolve dispute (demo mode)
   */
  async resolveDispute(
    contractAddress: string,
    releaseToReceiver: boolean,
    arbiterKey: string
  ): Promise<{ deployHash: string }> {
    console.log('Resolving dispute:', contractAddress, releaseToReceiver);
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
        : new CLOption(None, CLValueBuilder.key(senderKey).clType()),
      'due_date': params.dueDate
        ? new CLOption(Some(CLValueBuilder.u64(params.dueDate)))
        : new CLOption(None, CLValueBuilder.u64(0).clType()),
    });

    let deploy: DeployUtil.Deploy;

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
