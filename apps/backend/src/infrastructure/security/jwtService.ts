import { sign, verify } from 'hono/jwt';
import type { JWTPayload } from 'hono/utils/jwt/types';

export interface TokenClaims extends JWTPayload {
  sub: string; // User ID
  email: string;
  role: 'ADMIN' | 'ORGANIZER' | 'ATTENDEE' | 'STAFF';
  ticketId?: string; // Reutilizable para Fase 4 (Dynamic QR Code)
  exp: number; // Expiración en timestamp unix
  iat?: number;
}

export class JwtService {
  private static getSecret(): string {
    const secret = process.env.JWT_SECRET || 'dev_insecure_jwt_secret_change_in_production_min_32_chars';
    if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
      throw new Error('FATAL: JWT_SECRET debe tener al menos 32 caracteres en producción.');
    }
    return secret;
  }

  /**
   * Genera un token JWT stateless firmado con algoritmo HMAC SHA-256
   */
  static async generateToken(claims: Omit<TokenClaims, 'exp' | 'iat'>, expiresInSeconds: number = 3600): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const payload: TokenClaims = {
      ...claims,
      iat: now,
      exp: now + expiresInSeconds
    };
    return await sign(payload, this.getSecret(), 'HS256');
  }

  /**
   * Valida la firma criptográfica y expiración del JWT
   */
  static async verifyToken(token: string): Promise<TokenClaims> {
    const payload = await verify(token, this.getSecret(), 'HS256');
    return payload as unknown as TokenClaims;
  }
}
