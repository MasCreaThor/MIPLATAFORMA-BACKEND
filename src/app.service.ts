// Ruta: src/app.service.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from './modules/config/config.service';
import { DatabaseService } from './modules/database/database.service';
import { AppConfigService } from './modules/config/app.config';

/**
 * Servicio principal de la aplicación
 * Maneja operaciones comunes y de estado
 */
@Injectable()
export class AppService {
  constructor(
    private readonly configService: ConfigService,
    private readonly appConfigService: AppConfigService,
    private readonly databaseService: DatabaseService,
  ) {}

  /**
   * Retorna un mensaje de bienvenida
   * @returns Objeto con mensaje y timestamp
   */
  getHello(): { message: string; timestamp: string } {
    return {
      message: 'Bienvenido al Sistema de Gestión Personal de Conocimiento API',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Verifica el estado del servidor y sus servicios clave
   * @returns Estado de los distintos servicios
   */
  async getHealth(): Promise<Record<string, any>> {
    // Verificar estado de la base de datos
    const dbConnected = await this.databaseService.checkConnection();
    const dbPing = dbConnected ? await this.databaseService.ping() : false;

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: this.configService.get('NODE_ENV'),
      database: {
        connected: dbConnected,
        ping: dbPing,
        name: dbConnected ? this.databaseService.getDatabaseName() : null,
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }

  /**
   * Obtiene información sobre la API
   * @returns Información de configuración de la API
   */
  getApiInfo(): Record<string, any> {
    // Obtener solo información segura para compartir
    const config = this.appConfigService.getFullConfig();
    
    // Eliminar información sensible
    const safeConfig = {
      ...config,
      // Eliminar cualquier dato sensible
      cors: {
        ...config.cors,
        origin: typeof config.cors.origin === 'string' 
          ? config.cors.origin
          : 'Multiple origins configured'
      },
    };

    return {
      name: 'Sistema de Gestión Personal de Conocimiento API',
      version: '1.0.0',
      description: 'API para gestionar recursos personales y profesionales de conocimiento',
      config: safeConfig,
      endpoints: [
        { path: '/', method: 'GET', description: 'Mensaje de bienvenida' },
        { path: '/health', method: 'GET', description: 'Estado del servidor' },
        { path: '/info', method: 'GET', description: 'Información de la API' },
        { path: '/api/*', description: 'Rutas protegidas de la API' },
      ],
    };
  }
}