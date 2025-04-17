// Ruta: src/common/utils/hash.util.ts

import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

/**
 * Clase de utilidad para operaciones de hash y criptografía
 */
export class HashUtil {
  /**
   * Número de rondas de sal para bcrypt
   * Se recomienda un valor entre 10 y 12 para producción
   * Mayor valor = más seguro pero más lento
   */
  private static readonly SALT_ROUNDS = 10;

  /**
   * Genera un hash para una contraseña usando bcrypt
   * @param password Contraseña en texto plano
   * @returns Hash de la contraseña
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Compara una contraseña en texto plano con un hash
   * @param password Contraseña en texto plano
   * @param hash Hash almacenado
   * @returns true si coinciden, false en caso contrario
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Genera un token aleatorio
   * Útil para tokens de restablecimiento de contraseña, confirmación de email, etc.
   * @param size Tamaño del token en bytes (por defecto 32 = 64 caracteres hex)
   * @returns Token generado en formato hexadecimal
   */
  static generateToken(size = 32): string {
    return crypto.randomBytes(size).toString('hex');
  }

  /**
   * Genera un hash MD5 de una cadena
   * Útil para generar identificadores únicos
   * @param data Datos a hashear
   * @returns Hash MD5 en formato hexadecimal
   */
  static md5(data: string): string {
    return crypto.createHash('md5').update(data).digest('hex');
  }

  /**
   * Genera un hash SHA-256 de una cadena
   * @param data Datos a hashear
   * @returns Hash SHA-256 en formato hexadecimal
   */
  static sha256(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Genera un hash HMAC-SHA256 con una clave secreta
   * @param data Datos a hashear
   * @param secret Clave secreta para el HMAC
   * @returns Hash HMAC-SHA256 en formato hexadecimal
   */
  static hmacSha256(data: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  }

  /**
   * Encripta datos con AES-256-CBC
   * @param data Datos a encriptar
   * @param key Clave de encriptación (debe ser de 32 bytes)
   * @returns Datos encriptados en formato base64
   */
  static encrypt(data: string, key: string): string {
    // Generar IV aleatorio
    const iv = crypto.randomBytes(16);
    
    // Normalizar clave a 32 bytes
    const normalizedKey = this.normalizeKey(key, 32);
    
    // Crear cipher
    const cipher = crypto.createCipheriv('aes-256-cbc', normalizedKey, iv);
    
    // Encriptar
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Combinar IV con datos encriptados
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Desencripta datos con AES-256-CBC
   * @param encryptedData Datos encriptados en formato generado por encrypt()
   * @param key Clave de encriptación (debe ser de 32 bytes)
   * @returns Datos desencriptados
   */
  static decrypt(encryptedData: string, key: string): string {
    // Separar IV y datos encriptados
    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      throw new Error('Formato de datos encriptados inválido');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    // Normalizar clave a 32 bytes
    const normalizedKey = this.normalizeKey(key, 32);
    
    // Crear decipher
    const decipher = crypto.createDecipheriv('aes-256-cbc', normalizedKey, iv);
    
    // Desencriptar
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Normaliza una clave a una longitud específica
   * @param key Clave original
   * @param length Longitud deseada en bytes
   * @returns Buffer con la clave normalizada
   */
  private static normalizeKey(key: string, length: number): Buffer {
    if (!key) {
      throw new Error('La clave no puede estar vacía');
    }
    
    // Generar hash SHA-256 de la clave para normalizar longitud
    const hash = crypto.createHash('sha256').update(key).digest();
    return hash.slice(0, length);
  }
}