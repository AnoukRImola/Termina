import { z } from 'zod';

// Escrow states matching the smart contract
export const EscrowState = {
  Draft: 'draft',
  Accepted: 'accepted',
  Funded: 'funded',
  Released: 'released',
  Cancelled: 'cancelled',
  Disputed: 'disputed',
} as const;

export type EscrowState = (typeof EscrowState)[keyof typeof EscrowState];

// Request schemas
export const CreateEscrowSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  amount: z.number().positive(),
  payerAddress: z.string().min(1),
  arbiterAddress: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

export const FundEscrowSchema = z.object({
  amount: z.number().positive(),
});

export const DisputeEscrowSchema = z.object({
  reason: z.string().min(1),
});

export const ResolveDisputeSchema = z.object({
  releaseToReceiver: z.boolean(),
});

// Response types
export interface Invoice {
  id: string;
  description: string;
  amount: number;
  issuerAddress: string;
  payerAddress: string;
  arbiterAddress?: string;
  createdAt: string;
  dueDate?: string;
}

export interface EscrowResponse {
  contractAddress: string;
  state: EscrowState;
  invoice: Invoice;
  balance: number;
}

export interface TransactionResponse {
  success: boolean;
  deployHash: string;
  message: string;
}

// Type exports
export type CreateEscrowRequest = z.infer<typeof CreateEscrowSchema>;
export type FundEscrowRequest = z.infer<typeof FundEscrowSchema>;
export type DisputeEscrowRequest = z.infer<typeof DisputeEscrowSchema>;
export type ResolveDisputeRequest = z.infer<typeof ResolveDisputeSchema>;
