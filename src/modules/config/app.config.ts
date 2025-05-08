import { registerAs } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiPrefix: process.env.API_PREFIX || 'api',
}));

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get environment(): string {
    return this.configService.get<string>('app.environment') || 'development';
  }

  get port(): number {
    return this.configService.get<number>('app.port') || 3001;
  }

  get apiPrefix(): string {
    return this.configService.get<string>('app.apiPrefix') || 'api';
  }
}