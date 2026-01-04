import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { casperService, getAllDemoEscrows } from '../services/casper.js';
import {
  CreateEscrowSchema,
  FundEscrowSchema,
  DisputeEscrowSchema,
  ResolveDisputeSchema,
} from '../types/index.js';

const escrow = new Hono();

/**
 * List all demo escrows
 * GET /escrow
 */
escrow.get('/', async (c) => {
  const escrows = getAllDemoEscrows();
  return c.json({
    success: true,
    data: escrows,
    count: escrows.length,
  });
});

/**
 * Create a new escrow/invoice
 * POST /escrow
 */
escrow.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const validated = CreateEscrowSchema.parse(body);

    // Get issuer from header (in production, from auth)
    const issuerAddress = c.req.header('X-Issuer-Address') || 'demo-issuer';

    const result = await casperService.deployEscrow({
      ...validated,
      issuerAddress,
    });

    return c.json({
      success: true,
      data: result,
      message: 'Escrow created successfully',
    }, 201);
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 400);
  }
});

/**
 * Get escrow details
 * GET /escrow/:address
 */
escrow.get('/:address', async (c) => {
  const address = c.req.param('address');

  try {
    const result = await casperService.getEscrow(address);

    if (!result) {
      return c.json({
        success: false,
        error: 'Escrow not found',
      }, 404);
    }

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

/**
 * Accept escrow (payer)
 * POST /escrow/:address/accept
 */
escrow.post('/:address/accept', async (c) => {
  const address = c.req.param('address');

  try {
    // In production, get private key from secure source
    const payerKey = c.req.header('X-Payer-Key') || 'demo-key';

    const result = await casperService.acceptEscrow(address, payerKey);

    return c.json({
      success: true,
      data: result,
      message: 'Escrow accepted',
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 400);
  }
});

/**
 * Fund escrow (payer)
 * POST /escrow/:address/fund
 */
escrow.post('/:address/fund', async (c) => {
  const address = c.req.param('address');

  try {
    const body = await c.req.json();
    const { amount } = FundEscrowSchema.parse(body);
    const payerKey = c.req.header('X-Payer-Key') || 'demo-key';

    const result = await casperService.fundEscrow(address, amount, payerKey);

    return c.json({
      success: true,
      data: result,
      message: 'Escrow funded',
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 400);
  }
});

/**
 * Release funds (payer approves)
 * POST /escrow/:address/release
 */
escrow.post('/:address/release', async (c) => {
  const address = c.req.param('address');

  try {
    const payerKey = c.req.header('X-Payer-Key') || 'demo-key';

    const result = await casperService.releaseEscrow(address, payerKey);

    return c.json({
      success: true,
      data: result,
      message: 'Funds released',
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 400);
  }
});

/**
 * Cancel escrow
 * POST /escrow/:address/cancel
 */
escrow.post('/:address/cancel', async (c) => {
  const address = c.req.param('address');

  try {
    const callerKey = c.req.header('X-Caller-Key') || 'demo-key';

    const result = await casperService.cancelEscrow(address, callerKey);

    return c.json({
      success: true,
      data: result,
      message: 'Escrow cancelled',
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 400);
  }
});

/**
 * Raise dispute
 * POST /escrow/:address/dispute
 */
escrow.post('/:address/dispute', async (c) => {
  const address = c.req.param('address');

  try {
    const body = await c.req.json();
    const { reason } = DisputeEscrowSchema.parse(body);
    const callerKey = c.req.header('X-Caller-Key') || 'demo-key';

    const result = await casperService.disputeEscrow(address, reason, callerKey);

    return c.json({
      success: true,
      data: result,
      message: 'Dispute raised',
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 400);
  }
});

/**
 * Resolve dispute (arbiter only)
 * POST /escrow/:address/resolve
 */
escrow.post('/:address/resolve', async (c) => {
  const address = c.req.param('address');

  try {
    const body = await c.req.json();
    const { releaseToReceiver } = ResolveDisputeSchema.parse(body);
    const arbiterKey = c.req.header('X-Arbiter-Key') || 'demo-key';

    const result = await casperService.resolveDispute(address, releaseToReceiver, arbiterKey);

    return c.json({
      success: true,
      data: result,
      message: 'Dispute resolved',
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 400);
  }
});

export { escrow };
