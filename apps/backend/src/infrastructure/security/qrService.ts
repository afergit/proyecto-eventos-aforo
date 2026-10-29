import { JwtService, type TokenClaims } from '../security/jwtService';

/**
 * Servicio de generación y validación de códigos QR dinámicos.
 * Cada QR es un token JWT firmado que incluye:
 *   - ticketId (sub)
 *   - eventId (aud)
 *   - exp (tiempo de vida, por defecto 5 minutos para check‑in)
 *   - iat (issued at)
 *   - nonce aleatorio para evitar reproducción de tokens idénticos.
 *
 * En la fase 5, el cliente escaneará este QR y el backend validará la firma
 * y la expiración antes de marcar la entrada como "USED".
 */
export class QRService {
  /**
   * Genera un QR (JWT) con expiración configurable.
   * @param ticketId UUID del ticket que se está validando.
   * @param eventId UUID del evento asociado (usado como "aud" en el JWT).
   * @param expiresInSeconds tiempo de vida del QR en segundos (por defecto 300).
   */
  static async generateQR(ticketId: string, eventId: string, expiresInSeconds: number = 300): Promise<string> {
    const claims = {
      sub: ticketId,
      aud: eventId,
      nonce: crypto.randomUUID()
    } as const;
    return await JwtService.generateToken(claims, expiresInSeconds);
  }

  /**
   * Verifica la integridad y expiración del QR.
   * Devuelve los claims en caso de éxito o lanza error.
   */
  static async verifyQR(qrToken: string): Promise<TokenClaims> {
    return await JwtService.verifyToken(qrToken);
  }
}
