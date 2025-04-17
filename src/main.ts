// Ruta: src/main.ts

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as compression from 'compression';
import helmet from 'helmet'; // Importación corregida
import { AppModule } from './app.module';
import { AppConfigService } from './modules/config/app.config';
import { ConfigService } from './modules/config/config.service';

/**
 * Función principal para iniciar la aplicación NestJS
 */
async function bootstrap() {
  // Crear la aplicación NestJS
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Obtener configuración
  const configService = app.get(ConfigService);
  const appConfigService = app.get(AppConfigService);
  const port = appConfigService.getPort();
  const globalPrefix = appConfigService.getApiPrefix();
  const isProduction = configService.isProduction();

  // Configurar prefijo global para todas las rutas
  app.setGlobalPrefix(globalPrefix);

  // Configurar middlewares
  app.use(compression()); // Compresión de respuestas
  app.use(helmet()); // Uso corregido de helmet

  // Configurar CORS
  app.enableCors(appConfigService.getCorsOptions());

  // Configurar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no decoradas con class-validator
      forbidNonWhitelisted: true, // Lanza error si hay propiedades no permitidas
      transform: true, // Transforma los payload a instancias de DTO
      transformOptions: {
        enableImplicitConversion: true, // Convierte tipos primitivos automáticamente
      },
    }),
  );

  // Configurar Swagger para documentación de API (solo en entornos no productivos)
  if (!isProduction) {
    const swaggerConfig = appConfigService.getSwaggerConfig();
    const config = new DocumentBuilder()
      .setTitle(swaggerConfig.title)
      .setDescription(swaggerConfig.description)
      .setVersion(swaggerConfig.version)
      .addBearerAuth() // Soporte para autenticación JWT
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(swaggerConfig.path, app, document);
    
    Logger.log(
      `Documentación Swagger disponible en: http://localhost:${port}/${swaggerConfig.path}`,
      'Bootstrap',
    );
  }

  // Iniciar el servidor
  await app.listen(port);
  
  Logger.log(
    `Aplicación corriendo en: http://localhost:${port}/${globalPrefix}`,
    'Bootstrap',
  );
  
  if (!isProduction) {
    Logger.log(
      `Entorno: ${configService.get('NODE_ENV')}`,
      'Bootstrap',
    );
  }
}

// Iniciar la aplicación
bootstrap().catch(err => {
  Logger.error(`Error iniciando la aplicación: ${err}`, '', 'Bootstrap');
  process.exit(1);
});