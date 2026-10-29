import { describe, expect, it } from 'bun:test';
import { app } from '../src/index';

describe('Suite de Pruebas: Backend Core Foundation (AAA Pattern)', () => {
  it('Debe responder 200 OK con el estado operativo del microservicio', async () => {
    // Arrange (Organizar)
    const request = new Request('http://localhost/health');

    // Act (Actuar)
    const response = await app.fetch(request);
    const body = await response.json();

    // Assert (Afirmar)
    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.runtime).toBe('Bun');
    expect(body.framework).toBe('Hono');
  });

  it('Debe incluir cabeceras de seguridad OWASP en la respuesta', async () => {
    // Arrange
    const request = new Request('http://localhost/health');

    // Act
    const response = await app.fetch(request);

    // Assert (Validar Secure Headers OWASP)
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('x-frame-options')).toBe('SAMEORIGIN');
  });
});
