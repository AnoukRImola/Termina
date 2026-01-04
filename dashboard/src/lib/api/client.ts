/**
 * API Client for Termina Backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data: ApiResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    throw new ApiError(response.status, data.error || 'Request failed');
  }

  return data.data as T;
}

// Escrow/Invoice Types
export interface CreateEscrowParams {
  id: string;
  description: string;
  amount: number;
  payerAddress: string;
  arbiterAddress?: string;
  dueDate?: string;
}

export interface EscrowData {
  contractAddress: string;
  state: string;
  invoice: {
    id: string;
    description: string;
    amount: number;
    issuerAddress: string;
    payerAddress: string;
    createdAt: string;
  };
  balance: number;
}

export interface DeployResult {
  deployHash: string;
  contractAddress?: string;
}

export interface BuildDeployResult {
  deployJson: string;
}

// List response type
export interface EscrowListResponse {
  contractAddress: string;
  state: string;
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

// API Client
export const api = {
  // Health check
  async health(): Promise<{ status: string }> {
    return request('/health');
  },

  // Escrow operations (demo mode)
  escrow: {
    async list(): Promise<EscrowListResponse[]> {
      return request('/escrow');
    },

    async create(params: CreateEscrowParams, issuerAddress: string): Promise<DeployResult> {
      return request('/escrow', {
        method: 'POST',
        headers: {
          'X-Issuer-Address': issuerAddress,
        },
        body: JSON.stringify(params),
      });
    },

    async get(contractAddress: string): Promise<EscrowData> {
      return request(`/escrow/${contractAddress}`);
    },

    async accept(contractAddress: string, payerKey: string): Promise<DeployResult> {
      return request(`/escrow/${contractAddress}/accept`, {
        method: 'POST',
        headers: {
          'X-Payer-Key': payerKey,
        },
      });
    },

    async fund(contractAddress: string, amount: number, payerKey: string): Promise<DeployResult> {
      return request(`/escrow/${contractAddress}/fund`, {
        method: 'POST',
        headers: {
          'X-Payer-Key': payerKey,
        },
        body: JSON.stringify({ amount }),
      });
    },

    async release(contractAddress: string, payerKey: string): Promise<DeployResult> {
      return request(`/escrow/${contractAddress}/release`, {
        method: 'POST',
        headers: {
          'X-Payer-Key': payerKey,
        },
      });
    },

    async cancel(contractAddress: string, callerKey: string): Promise<DeployResult> {
      return request(`/escrow/${contractAddress}/cancel`, {
        method: 'POST',
        headers: {
          'X-Caller-Key': callerKey,
        },
      });
    },

    async dispute(contractAddress: string, reason: string, callerKey: string): Promise<DeployResult> {
      return request(`/escrow/${contractAddress}/dispute`, {
        method: 'POST',
        headers: {
          'X-Caller-Key': callerKey,
        },
        body: JSON.stringify({ reason }),
      });
    },

    async resolve(contractAddress: string, releaseToReceiver: boolean, arbiterKey: string): Promise<DeployResult> {
      return request(`/escrow/${contractAddress}/resolve`, {
        method: 'POST',
        headers: {
          'X-Arbiter-Key': arbiterKey,
        },
        body: JSON.stringify({ releaseToReceiver }),
      });
    },
  },

  // Deploy operations (production mode with wallet signing)
  deploy: {
    async buildCreate(params: {
      id: string;
      description: string;
      amount: number;
      issuerPublicKey: string;
      payerPublicKey: string;
      arbiterPublicKey?: string;
      dueDate?: number;
    }): Promise<BuildDeployResult> {
      return request('/deploy/build/create', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    },

    async buildAccept(contractHash: string, payerPublicKey: string): Promise<BuildDeployResult> {
      return request('/deploy/build/accept', {
        method: 'POST',
        body: JSON.stringify({ contractHash, payerPublicKey }),
      });
    },

    async buildFund(contractHash: string, amount: number, payerPublicKey: string): Promise<BuildDeployResult> {
      return request('/deploy/build/fund', {
        method: 'POST',
        body: JSON.stringify({ contractHash, amount, payerPublicKey }),
      });
    },

    async buildRelease(contractHash: string, payerPublicKey: string): Promise<BuildDeployResult> {
      return request('/deploy/build/release', {
        method: 'POST',
        body: JSON.stringify({ contractHash, payerPublicKey }),
      });
    },

    async submit(signedDeployJson: string): Promise<DeployResult> {
      return request('/deploy/submit', {
        method: 'POST',
        body: JSON.stringify({ signedDeployJson }),
      });
    },

    async status(deployHash: string): Promise<{
      found: boolean;
      executed: boolean;
      success?: boolean;
      errorMessage?: string;
    }> {
      return request(`/deploy/status/${deployHash}`);
    },
  },
};

export { ApiError };
