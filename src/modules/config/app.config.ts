// Ruta: src/modules/config/app.config.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from './config.service';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

/**
 * Servicio para la configuración general de la aplicación
 * Proporciona configuraciones para el servidor, CORS, y otras opciones globales
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Obtiene el puerto en el que escuchará la aplicación
   * @returns Número de puerto
   */
  getPort(): number {
    return this.configService.getNumber('PORT', 3001);
  }

  /**
   * Obtiene el prefijo para las rutas de la API
   * @returns Prefijo de la API
   */
  getApiPrefix(): string {
    return this.configService.getString('API_PREFIX', 'api');
  }

  /**
   * Obtiene el entorno de la aplicación
   * @returns Entorno (development, production, test)
   */
  getNodeEnv(): string {
    return this.configService.getString('NODE_ENV', 'development');
  }

  /**
   * Obtiene la configuración para CORS
   * @returns Opciones de CORS
   */
  getCorsOptions(): CorsOptions {
    const corsOrigin = this.configService.getString('CORS_ORIGIN', 'http://localhost:3000');
    
    // Si es una lista separada por comas, convertirla en array
    const origins = corsOrigin.includes(',')
      ? corsOrigin.split(',').map(origin => origin.trim())
      : corsOrigin;
    
    return {
      origin: origins,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      maxAge: 86400, // 24 horas
    };
  }

  /**
   * Obtiene el nivel de logs para la aplicación
   * @returns Nivel de logs
   */
  getLogLevel(): string {
    return this.configService.getString('LOG_LEVEL', 'info');
  }

  /**
   * Verifica si la aplicación debe generar documentación Swagger
   * @returns true si debe generar documentación, false en caso contrario
   */
  isSwaggerEnabled(): boolean {
    return !this.configService.isProduction();
  }

  /**
   * Obtiene la configuración para la documentación Swagger
   * @returns Opciones para Swagger
   */
  getSwaggerConfig(): Record<string, any> {
    return {
      title: 'Sistema de Gestión Personal de Conocimiento API',
      description: 'API para el Sistema de Gestión Personal de Conocimiento',
      version: '1.0',
      path: 'docs',
    };
  }

  /**
   * Obtiene la configuración para rate limiting
   * @returns Opciones para rate limiting
   */
  getRateLimitConfig(): Record<string, any> {
    return {
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // Límite de 100 solicitudes por ventana
      standardHeaders: true,
      legacyHeaders: false,
    };
  }

  /**
   * Obtiene la configuración completa de la aplicación
   * @returns Objeto con toda la configuración de la aplicación
   */
  getFullConfig(): Record<string, any> {
    return {
      port: this.getPort(),
      apiPrefix: this.getApiPrefix(),
      environment: this.getNodeEnv(),
      isDevelopment: this.configService.isDevelopment(),
      isProduction: this.configService.isProduction(),
      isTest: this.configService.isTest(),
      cors: this.getCorsOptions(),
      logLevel: this.getLogLevel(),
      swagger: {
        enabled: this.isSwaggerEnabled(),
        ...this.getSwaggerConfig(),
      },
      rateLimit: this.getRateLimitConfig(),
    };
  }
}