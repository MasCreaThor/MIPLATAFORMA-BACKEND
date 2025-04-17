// Ruta: src/modules/config/config.service.ts

import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

/**
 * Servicio para acceder a las configuraciones de la aplicación
 * Extiende la funcionalidad de ConfigService de @nestjs/config
 */
@Injectable()
export class ConfigService {
  constructor(private readonly nestConfigService: NestConfigService) {}

  /**
   * Obtiene un valor de configuración tipado
   * @param key Clave de configuración
   * @param defaultValue Valor por defecto si no existe
   * @returns Valor de la configuración tipado
   */
  get<T>(key: string, defaultValue?: T): T {
    const value = this.nestConfigService.get<T>(key);
    
    if (value === undefined) {
      if (defaultValue === undefined) {
        throw new Error(`Configuration key "${key}" is not defined and no default value was provided`);
      }
      return defaultValue;
    }
    
    return value;
  }

  /**
   * Obtiene un valor de configuración como string
   * @param key Clave de configuración
   * @param defaultValue Valor por defecto si no existe
   * @returns Valor de la configuración como string
   */
  getString(key: string, defaultValue?: string): string {
    return this.get<string>(key, defaultValue);
  }

  /**
   * Obtiene un valor de configuración como number
   * @param key Clave de configuración
   * @param defaultValue Valor por defecto si no existe
   * @returns Valor de la configuración como number
   */
  getNumber(key: string, defaultValue?: number): number {
    const value = this.get<string | number>(key, defaultValue as any);
    return typeof value === 'string' ? parseInt(value, 10) : value;
  }

  /**
   * Obtiene un valor de configuración como boolean
   * @param key Clave de configuración
   * @param defaultValue Valor por defecto si no existe
   * @returns Valor de la configuración como boolean
   */
  getBoolean(key: string, defaultValue?: boolean): boolean {
    const value = this.get<string | boolean>(key, defaultValue as any);
    if (typeof value === 'string') {
      return value === 'true' || value === '1';
    }
    return value;
  }

  /**
   * Verifica si la aplicación está en modo desarrollo
   * @returns true si está en desarrollo, false en caso contrario
   */
  isDevelopment(): boolean {
    return this.get<string>('NODE_ENV', 'development') === 'development';
  }

  /**
   * Verifica si la aplicación está en modo producción
   * @returns true si está en producción, false en caso contrario
   */
  isProduction(): boolean {
    return this.get<string>('NODE_ENV', 'development') === 'production';
  }

  /**
   * Verifica si la aplicación está en modo test
   * @returns true si está en test, false en caso contrario
   */
  isTest(): boolean {
    return this.get<string>('NODE_ENV', 'development') === 'test';
  }

  /**
   * Obtiene todas las variables de entorno como un objeto
   * @returns Objeto con todas las variables de entorno
   */
  getAll(): Record<string, any> {
    return {
      // Configuración general
      nodeEnv: this.get<string>('NODE_ENV', 'development'),
      port: this.getNumber('PORT', 3001),
      apiPrefix: this.getString('API_PREFIX', 'api'),
      corsOrigin: this.getString('CORS_ORIGIN', 'http://localhost:3000'),
      
      // Configuración de MongoDB
      mongodbUri: this.getString('MONGODB_URI', 'mongodb://localhost:27017/resource-database'),
      mongodbHost: this.getString('MONGODB_HOST', 'localhost'),
      mongodbPort: this.getNumber('MONGODB_PORT', 27017),
      mongodbDatabase: this.getString('MONGODB_DATABASE', 'resource-database'),
      
      // Configuración de JWT
      jwtSecret: this.getString('JWT_SECRET', 'default_jwt_secret_for_development'),
      jwtExpiration: this.getNumber('JWT_EXPIRATION', 3600),
      jwtRefreshExpiration: this.getNumber('JWT_REFRESH_EXPIRATION', 86400),
      
      // Configuración de logs
      logLevel: this.getString('LOG_LEVEL', 'info'),
    };
  }
}