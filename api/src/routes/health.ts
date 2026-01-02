import { Hono } from 'hono';

const health = new Hono();

health.get('/', (c) => {
  return c.json({
    status: 'ok',
    service: 'termina-api',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  });
});

health.get('/ready', (c) => {
  // TODO: Add actual readiness checks (DB, Casper node, etc.)
  return c.json({
    ready: true,
    checks: {
      casper: true,
      database: true,
    },
  });
});

export { health };
