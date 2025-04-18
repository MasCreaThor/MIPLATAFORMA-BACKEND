// src/modules/config/config.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  get<T>(key: string): T {
    const value = this.configService.get<T>(key);
    if (value === undefined) {
      throw new Error(`La clave de configuración "${key}" no está definida.`);
    }
    return value;
  }

  getPort(): number {
    return this.get<number>('PORT') || 3001;
  }

  getMongoUri(): string {
    return this.get<string>('MONGODB_URI');
  }

  getJwtSecret(): string {
    return this.get<string>('JWT_SECRET');
  }

  getJwtExpiresIn(): string {
    return `${this.get<string>('JWT_EXPIRATION')}s`;
  }

  getJwtRefreshExpiresIn(): string {
    return `${this.get<string>('JWT_REFRESH_EXPIRATION')}s`;
  }

  getApiPrefix(): string {
    return this.get<string>('API_PREFIX') || 'api';
  }

  getCorsOrigin(): string {
    return this.get<string>('CORS_ORIGIN') || 'http://localhost:3000';
  }
}