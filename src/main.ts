import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from './modules/config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Configuración global
  app.setGlobalPrefix(configService.get<string>('app.apiPrefix') || 'api');
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN') || '*',
  });
  
  // Pipes para validación
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Iniciar servidor
  const port = configService.get<number>('app.port') || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();