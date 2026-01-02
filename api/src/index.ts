import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { health } from './routes/health.js';
import { escrow } from './routes/escrow.js';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Issuer-Address', 'X-Payer-Key', 'X-Caller-Key', 'X-Arbiter-Key'],
}));

// Routes
app.route('/health', health);
app.route('/escrow', escrow);

// Root
app.get('/', (c) => {
  return c.json({
    name: 'Termina API',
    version: '0.1.0',
    description: 'Escrow infrastructure for B2B workflows on Casper',
    endpoints: {
      health: '/health',
      escrow: '/escrow',
    },
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Not found',
  }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({
    success: false,
    error: err.message || 'Internal server error',
  }, 500);
});

const port = parseInt(process.env.PORT || '3001');

console.log(`
╔════════════════════════════════════════╗
║         TERMINA API                    ║
║   Escrow Infrastructure on Casper      ║
╚════════════════════════════════════════╝

Server running on http://localhost:${port}
`);

export default {
  port,
  fetch: app.fetch,
};
