export interface PasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
}

/**
 * Servicio de hashing de alta seguridad aprovechando la API nativa de Bun.
 * Por defecto usa Argon2id / Bcrypt optimizado en Zig/C, eliminando la sobrecarga de V8/Node.js.
 */
export class BunPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    if (!password || password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres según políticas de seguridad OWASP.');
    }
    // Bun.password.hash utiliza argon2id de forma nativa con salt criptográfico automático
    return await Bun.password.hash(password, {
      algorithm: 'argon2id',
      memoryCost: 65536, // 64 MB
      timeCost: 3
    });
  }

  async verify(password: string, hash: string): Promise<boolean> {
    if (!password || !hash) {
      return false;
    }
    return await Bun.password.verify(password, hash);
  }
}
