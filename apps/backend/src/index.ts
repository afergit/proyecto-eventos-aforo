import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { Logger } from './infrastructure/logging/logger';
import { BunPasswordHasher } from './infrastructure/security/passwordHasher';
import { JwtService } from './infrastructure/security/jwtService';
import { authMiddleware } from './presentation/middlewares/authMiddleware';
import { AzureBlobStorageService } from './infrastructure/storage/azureBlobService';

export const app = new Hono();
const passwordHasher = new BunPasswordHasher();
const storageService = new AzureBlobStorageService();

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

// --- Rutas de Autenticación (Fase 2) ---
app.post('/api/v1/auth/login', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { email, password } = body;

  if (!email || !password) {
    return c.json({ success: false, error: 'Email y contraseña requeridos.' }, 400);
  }

  // Ejemplo de simulación de verificación con Bun.password
  const mockDbPasswordHash = await passwordHasher.hash('SuperSecret2026!');
  const isMatch = await passwordHasher.verify(password, mockDbPasswordHash);

  if (!isMatch || email !== 'admin@eventos.com') {
    Logger.warn('Intento de inicio de sesión fallido', { email });
    return c.json({ success: false, error: 'Credenciales inválidas.' }, 401);
  }

  const token = await JwtService.generateToken({
    sub: 'usr_admin_001',
    email,
    role: 'ADMIN'
  }, 3600);

  return c.json({
    success: true,
    data: {
      token,
      expiresIn: 3600,
      tokenType: 'Bearer'
    }
  });
});

// Ruta protegida con JWT Middleware
app.get('/api/v1/user/profile', authMiddleware, (c) => {
  const user = c.get('user');
  return c.json({
    success: true,
    data: {
      profile: user,
      message: 'Acceso autorizado mediante token JWT verificado.'
    }
  });
});

// Endpoint para subir comprobantes o imágenes con Azure Blob Storage
app.post('/api/v1/storage/upload', authMiddleware, async (c) => {
  const body = await c.req.parseBody();
  const file = body['file'];

  if (!file || !(file instanceof File)) {
    return c.json({ success: false, error: 'No se envió ningún archivo válido.' }, 400);
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const result = await storageService.uploadFile(buffer, file.name, file.type);

  return c.json({
    success: true,
    data: result
  });
});

const PORT = process.env.PORT || 4000;
console.log(`Server starting on port ${PORT}...`);

export default {
  port: PORT,
  fetch: app.fetch
};
