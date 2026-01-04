import { NextRequest, NextResponse } from 'next/server';
import { runEscrowDemo } from '@/lib/casper/keys';

// Get payer mnemonic from environment variable
const PAYER_MNEMONIC = process.env.DEMO_PAYER_MNEMONIC || '';

export async function POST(request: NextRequest) {
  try {
    // Validate environment setup
    if (!PAYER_MNEMONIC) {
      return NextResponse.json(
        { error: 'Demo not configured. Missing DEMO_PAYER_MNEMONIC.' },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { issuerAddress, description, amount } = body;

    // Validate input
    if (!issuerAddress || typeof issuerAddress !== 'string') {
      return NextResponse.json(
        { error: 'Invalid issuer address' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Invalid description' },
        { status: 400 }
      );
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Limit demo amount to prevent abuse (max 100 CSPR)
    const maxAmount = 100_000_000_000; // 100 CSPR in motes
    if (amount > maxAmount) {
      return NextResponse.json(
        { error: 'Amount exceeds demo limit of 100 CSPR' },
        { status: 400 }
      );
    }

    // Run the escrow demo
    const result = await runEscrowDemo(
      issuerAddress,
      description,
      BigInt(Math.floor(amount)),
      PAYER_MNEMONIC
    );

    if (result.error) {
      return NextResponse.json(
        { error: result.error, transactions: result.transactions },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transactions: result.transactions
    });

  } catch (error) {
    console.error('Demo escrow API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
