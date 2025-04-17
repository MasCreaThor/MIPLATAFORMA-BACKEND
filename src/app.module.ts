// Ruta: src/app.module.ts

import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Módulos creados previamente
import { DatabaseModule } from './modules/database/database.module';
import { ConfigModule } from './modules/config/config.module';

// Comentamos los módulos que aún no se han implementado para evitar errores
// import { AuthModule } from './modules/auth/auth.module';
// import { UsersModule } from './modules/users/users.module';
// import { ResourcesModule } from './modules/resources/resources.module';
// import { KnowledgeModule } from './modules/knowledge/knowledge.module';
// import { ProjectsModule } from './modules/projects/projects.module';
// import { DashboardModule } from './modules/dashboard/dashboard.module';

// Importamos los filtros, guardias, interceptores, pipes y middleware que hemos creado
// Si aún no existen estos archivos, los comentamos hasta que estén implementados
/* 
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationFilter } from './common/filters/validation.filter';
import { RolesGuard } from './common/guards/roles.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
*/

/**
 * Módulo principal de la aplicación
 * Importa todos los módulos y establece configuraciones globales
 */
@Module({
  imports: [
    // Módulos base para infraestructura
    ConfigModule,
    DatabaseModule,
    
    // Módulos funcionales (comentados hasta que se implementen)
    // AuthModule,
    // UsersModule,
    // ResourcesModule,
    // KnowledgeModule,
    // ProjectsModule,
    // DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Comentamos los proveedores hasta que se implementen sus clases correspondientes
    /*
    // Filtros globales para manejo de excepciones
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ValidationFilter,
    },
    // Guardia global para control de acceso basado en roles
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // Interceptores globales para logging y transformación de respuestas
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    // Pipe global para validación de datos
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    */
  ],
})
export class AppModule {
  /**
   * Configura middleware global para la aplicación
   * @param consumer Consumidor de middleware
   */
  configure(consumer: MiddlewareConsumer) {
    // Comentamos la configuración del middleware hasta que exista la clase
    /*
    // Aplica el middleware de logging a todas las rutas
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
    */
  }
}