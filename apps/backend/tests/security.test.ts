import { describe, expect, it } from 'bun:test';
import { BunPasswordHasher } from '../src/infrastructure/security/passwordHasher';
import { JwtService } from '../src/infrastructure/security/jwtService';
import { AzureBlobStorageService } from '../src/infrastructure/storage/azureBlobService';
import { app } from '../src/index';

describe('Fase 2: Suite de Pruebas de Seguridad e Identidad (AAA Pattern)', () => {

  describe('Bun.password Hashing con Salt Criptográfico', () => {
    const hasher = new BunPasswordHasher();

    it('Debe generar un hash Argon2id válido y verificar la contraseña correcta', async () => {
      // Arrange
      const plainPassword = 'PasswordSeguro123!';

      // Act
      const hash = await hasher.hash(plainPassword);
      const isMatch = await hasher.verify(plainPassword, hash);

      // Assert
      expect(hash).toBeDefined();
      expect(hash.startsWith('$argon2id$')).toBe(true);
      expect(isMatch).toBe(true);
    });

    it('Debe rechazar una contraseña incorrecta contra el hash', async () => {
      // Arrange
      const plainPassword = 'PasswordSeguro123!';
      const wrongPassword = 'PasswordIncorrecto!';
      const hash = await hasher.hash(plainPassword);

      // Act
      const isMatch = await hasher.verify(wrongPassword, hash);

      // Assert
      expect(isMatch).toBe(false);
    });

    it('Debe fallar si la contraseña no cumple la longitud mínima OWASP (8 chars)', async () => {
      // Arrange & Act & Assert
      expect(hasher.hash('12345')).rejects.toThrow('al menos 8 caracteres');
    });
  });

  describe('Autenticación Stateless JWT', () => {
    it('Debe emitir un token firmado y decodificar claims íntegros', async () => {
      // Arrange
      const payload = {
        sub: 'usr_unit_test_99',
        email: 'tester@eventos.com',
        role: 'ATTENDEE' as const
      };

      // Act
      const token = await JwtService.generateToken(payload, 300);
      const claims = await JwtService.verifyToken(token);

      // Assert
      expect(token).toBeDefined();
      expect(claims.sub).toBe(payload.sub);
      expect(claims.email).toBe(payload.email);
      expect(claims.role).toBe(payload.role);
    });

    it('Debe rechazar tokens firmados con llave incorrecta o manipulados', async () => {
      // Arrange
      const forgedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.fake_signature';

      // Act & Assert
      expect(JwtService.verifyToken(forgedToken)).rejects.toThrow();
    });
  });

  describe('Middleware de Autorización en Rutas Hono', () => {
    it('Debe retornar 401 Unauthorized cuando la petición no incluye cabecera Bearer', async () => {
      // Arrange
      const req = new Request('http://localhost/api/v1/user/profile');

      // Act
      const res = await app.fetch(req);
      const data = await res.json();

      // Assert
      expect(res.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('Debe permitir acceso 200 OK con token JWT legítimo', async () => {
      // Arrange
      const validToken = await JwtService.generateToken({
        sub: 'usr_valid_01',
        email: 'valido@eventos.com',
        role: 'ORGANIZER'
      });
      const req = new Request('http://localhost/api/v1/user/profile', {
        headers: {
          'Authorization': `Bearer ${validToken}`
        }
      });

      // Act
      const res = await app.fetch(req);
      const body = await res.json();

      // Assert
      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.profile.email).toBe('valido@eventos.com');
    });
  });

  describe('Azure Blob Storage & SAS Token Desacoplado', () => {
    const storage = new AzureBlobStorageService();

    it('Debe generar URL de descarga temporal con parámetros SAS', () => {
      // Arrange
      const blobName = 'test-comprobante.pdf';

      // Act
      const downloadUrl = storage.generateDownloadUrl(blobName, 15);

      // Assert
      expect(downloadUrl).toContain(blobName);
      expect(downloadUrl).toContain('?');
    });
  });
});
