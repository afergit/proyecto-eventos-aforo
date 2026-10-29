import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { Logger } from './infrastructure/logging/logger';

export const app = new Hono();

// OWASP Security & Middleware
app.use('*', secureHeaders());
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

// Request Tracking Middleware (Structured Logs)
app.use('*', async (c, next) => {
  const start = Date.now();
  const traceId = crypto.randomUUID();
  c.set('traceId', traceId);

  Logger.info(`Incoming Request: ${c.req.method} ${c.req.url}`, {
    method: c.req.method,
    path: c.req.path
  }, traceId);

  await next();

  const duration = Date.now() - start;
  Logger.info(`Completed Request: ${c.req.method} ${c.req.url} - Status ${c.res.status}`, {
    status: c.res.status,
    durationMs: duration
  }, traceId);
});

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'eventos-aforo-backend',
    runtime: 'Bun',
    framework: 'Hono',
    timestamp: new Date().toISOString()
  });
});

// Root API
app.get('/api/v1', (c) => {
  return c.json({
    message: 'Sistema de Venta, Reventa y Control de Aforo API v1',
    phase: 1,
    status: 'Operational'
  });
});

const PORT = process.env.PORT || 4000;
console.log(`Server starting on port ${PORT}...`);

export default {
  port: PORT,
  fetch: app.fetch
};
