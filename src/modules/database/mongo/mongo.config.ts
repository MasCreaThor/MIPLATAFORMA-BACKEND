// Ruta: src/modules/database/mongo/mongo.config.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MongoConfig {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Obtiene la configuración de conexión para MongoDB
   * @returns Objeto con la configuración de conexión
   */
  getConnectionOptions(): Record<string, any> {
    return {
      uri: this.getUri(),
      // Eliminamos las opciones obsoletas useNewUrlParser y useUnifiedTopology
      connectTimeoutMS: this.getConnectTimeout(),
      socketTimeoutMS: this.getSocketTimeout(),
    };
  }

  /**
   * Obtiene la URI de conexión a MongoDB
   * @returns URI de conexión a MongoDB
   */
  getUri(): string {
    // Si se define una URI completa, usarla
    const uri = this.configService.get<string>('MONGODB_URI');
    if (uri) {
      return uri;
    }

    // Si no hay URI completa, construirla con los componentes individuales
    const host = this.configService.get<string>('MONGODB_HOST', 'localhost');
    const port = this.configService.get<number>('MONGODB_PORT', 27017);
    const database = this.configService.get<string>('MONGODB_DATABASE', 'resource-database');
    const username = this.configService.get<string>('MONGODB_USERNAME', '');
    const password = this.configService.get<string>('MONGODB_PASSWORD', '');
    const authSource = this.configService.get<string>('MONGODB_AUTH_SOURCE', 'admin');

    // Construir la URI basada en si hay credenciales o no
    if (username && password) {
      return `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=${authSource}`;
    } else {
      return `mongodb://${host}:${port}/${database}`;
    }
  }

  /**
   * Obtiene el nombre de la base de datos
   * @returns Nombre de la base de datos
   */
  getDatabaseName(): string {
    return this.configService.get<string>('MONGODB_DATABASE', 'resource-database');
  }

  /**
   * Obtiene el tiempo de espera para la conexión inicial
   * @returns Tiempo de espera en milisegundos
   */
  getConnectTimeout(): number {
    return this.configService.get<number>('MONGODB_CONNECT_TIMEOUT', 5000);
  }

  /**
   * Obtiene el tiempo de espera para las operaciones de socket
   * @returns Tiempo de espera en milisegundos
   */
  getSocketTimeout(): number {
    return this.configService.get<number>('MONGODB_SOCKET_TIMEOUT', 30000);
  }

  /**
   * Obtiene el tamaño del pool de conexiones
   * @returns Tamaño del pool
   */
  getPoolSize(): number {
    return this.configService.get<number>('MONGODB_POOL_SIZE', 10);
  }

  /**
   * Verifica si la depuración de Mongoose está habilitada
   * @returns Indicador de depuración
   */
  isDebugEnabled(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'development';
  }
}