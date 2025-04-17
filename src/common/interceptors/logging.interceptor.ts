// Ruta: src/common/interceptors/logging.interceptor.ts

import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { tap } from 'rxjs/operators';
  import { Request, Response } from 'express';
  
  /**
   * Interceptor para registrar información sobre solicitudes y respuestas
   * Registra tiempo de ejecución y detalles de cada solicitud HTTP
   */
  @Injectable()
  export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);
  
    /**
     * Intercepta la solicitud para registrar información
     * @param context Contexto de ejecución
     * @param next Manejador para continuar la ejecución
     * @returns Observable con la respuesta
     */
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      // Obtener la solicitud HTTP
      const ctx = context.switchToHttp();
      const request = ctx.getRequest<Request>();
      const response = ctx.getResponse<Response>();
      
      // Obtener información de la solicitud
      const { method, url, ip, headers } = request;
      const userAgent = headers['user-agent'] || 'unknown';
      
      // Registrar inicio de la solicitud
      const startTime = Date.now();
      this.logger.log(
        `Solicitud iniciada - ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`,
      );
  
      // Procesar solicitud y registrar finalización
      return next.handle().pipe(
        tap({
          next: (data: any) => this.logSuccess(data, method, url, response.statusCode, startTime),
          error: (error: any) => this.logError(error, method, url, startTime),
        }),
      );
    }
  
    /**
     * Registra una solicitud exitosa
     * @param data Datos de respuesta
     * @param method Método HTTP
     * @param url URL de la solicitud
     * @param statusCode Código de estado HTTP
     * @param startTime Tiempo de inicio en milisegundos
     */
    private logSuccess(
      data: any, 
      method: string, 
      url: string, 
      statusCode: number, 
      startTime: number
    ): void {
      const duration = Date.now() - startTime;
      
      // Calcular tamaño de la respuesta (aproximado)
      let responseSize = 'desconocido';
      try {
        if (data) {
          responseSize = `~${JSON.stringify(data).length} bytes`;
        }
      } catch (err) {
        // Si no se puede calcular el tamaño, mantener "desconocido"
      }
      
      this.logger.log(
        `Solicitud completada - ${method} ${url} - Estado: ${statusCode} - Duración: ${duration}ms - Tamaño: ${responseSize}`,
      );
    }
  
    /**
     * Registra una solicitud con error
     * @param error Error ocurrido
     * @param method Método HTTP
     * @param url URL de la solicitud
     * @param startTime Tiempo de inicio en milisegundos
     */
    private logError(
      error: any, 
      method: string, 
      url: string, 
      startTime: number
    ): void {
      const duration = Date.now() - startTime;
      
      // Obtener código de estado del error
      const statusCode = error.status || error.statusCode || 500;
      
      this.logger.error(
        `Solicitud fallida - ${method} ${url} - Estado: ${statusCode} - Duración: ${duration}ms`,
        error.stack,
      );
    }
  }