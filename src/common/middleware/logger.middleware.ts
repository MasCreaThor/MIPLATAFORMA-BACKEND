// Ruta: src/common/middleware/logger.middleware.ts

import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para registrar información de solicitudes HTTP
 * Registra detalles de cada solicitud entrante antes de procesarla
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  /**
   * Procesa la solicitud HTTP y registra información
   * @param request Solicitud HTTP
   * @param response Respuesta HTTP
   * @param next Función para continuar la cadena de middleware
   */
  use(request: Request, response: Response, next: NextFunction): void {
    // Guardar tiempo de inicio para calcular duración
    const { method, originalUrl, ip } = request;
    const userAgent = request.get('user-agent') || '';
    
    // Registrar inicio de solicitud
    this.logger.log(
      `${method} ${originalUrl} - ${ip} - ${userAgent}`,
    );

    // Procesar la solicitud y registrar finalización
    const startTime = Date.now();
    
    // Interceptar el método end() para registrar la finalización
    const originalEnd = response.end;
    
    // Sobrescribir el método end manteniendo el tipo de retorno correcto
    response.end = function(this: Response, ...args: any[]): Response {
      const responseTime = Date.now() - startTime;
      const contentLength = response.get('content-length') || '0';
      
      Logger.log(
        `${method} ${originalUrl} ${response.statusCode} ${responseTime}ms - ${contentLength}b`,
        'HTTP',
      );
      
      // Llamar al método original y retornar su resultado
      return originalEnd.apply(this, args);
    } as typeof response.end;

    next();
  }
}