// Ruta: src/modules/config/config.service.ts

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

  getJwtConfig() {
    return {
      secret: this.configService.get<string>('jwt.secret'),
      expirationTime: this.configService.get<number>('jwt.expirationTime'),
      refreshExpirationTime: this.configService.get<number>('jwt.refreshExpirationTime'),
    };
  }

  getMongoConfig() {
    return {
      uri: this.configService.get<string>('database.uri'),
    };
  }

  getAppConfig() {
    return {
      port: this.configService.get<number>('app.port'),
      environment: this.configService.get<string>('app.environment'),
      apiPrefix: this.configService.get<string>('app.apiPrefix'),
    };
  }
}