// Ruta: src/modules/config/config.module.ts

import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { ConfigService } from './config.service';
import { JwtConfigService } from './jwt.config';
import { AppConfigService } from './app.config';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local', `.env.${process.env.NODE_ENV}`],
      validationSchema: Joi.object({
        // Configuración general
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3001),
        API_PREFIX: Joi.string().default('api'),
        CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
        
        // Configuración de MongoDB
        MONGODB_URI: Joi.string(),
        MONGODB_HOST: Joi.string().default('localhost'),
        MONGODB_PORT: Joi.number().default(27017),
        MONGODB_DATABASE: Joi.string().default('resource-database'),
        MONGODB_USERNAME: Joi.string().allow(''),
        MONGODB_PASSWORD: Joi.string().allow(''),
        MONGODB_AUTH_SOURCE: Joi.string().default('admin'),
        MONGODB_CONNECT_TIMEOUT: Joi.number().default(5000),
        MONGODB_SOCKET_TIMEOUT: Joi.number().default(30000),
        
        // Configuración de JWT
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.number().default(3600),
        JWT_REFRESH_EXPIRATION: Joi.number().default(86400),
        
        // Configuración de logs
        LOG_LEVEL: Joi.string()
          .valid('error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly')
          .default('info')
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
  ],
  providers: [
    ConfigService,
    JwtConfigService,
    AppConfigService,
  ],
  exports: [
    ConfigService,
    JwtConfigService,
    AppConfigService,
  ],
})
export class ConfigModule {}