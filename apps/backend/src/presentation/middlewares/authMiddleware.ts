import type { MiddlewareHandler } from 'hono';
import { JwtService, type TokenClaims } from '../../infrastructure/security/jwtService';
import { Logger } from '../../infrastructure/logging/logger';

declare module 'hono' {
  interface ContextVariableMap {
    user: TokenClaims;
  }
}

/**
 * Middleware para validar autenticación Stateless vía Bearer Token
 */
export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    Logger.warn('Acceso denegado: Cabecera Authorization no presente o formato inválido', {
      path: c.req.path
    });
    return c.json({
      success: false,
      error: 'Autenticación requerida. Token Bearer ausente o malformado.'
    }, 401);
  }

  const token = authHeader.substring(7);

  try {
    const claims = await JwtService.verifyToken(token);
    c.set('user', claims);
    await next();
  } catch (error) {
    Logger.warn('Fallo de verificación de token JWT', {
      path: c.req.path,
      error: error instanceof Error ? error.message : 'Token verification failed'
    });
    return c.json({
      success: false,
      error: 'Token inválido o expirado.'
    }, 401);
  }
};
