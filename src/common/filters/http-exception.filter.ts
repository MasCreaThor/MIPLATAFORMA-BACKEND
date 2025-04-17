// Ruta: src/common/filters/http-exception.filter.ts

import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
  } from '@nestjs/common';
  import { Request, Response } from 'express';
  
  /**
   * Filtro global para capturar y formatear excepciones HTTP
   * Proporciona un formato consistente para todas las respuestas de error
   */
  @Catch(HttpException)
  export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);
  
    /**
     * Método que captura y procesa excepciones
     * @param exception La excepción capturada
     * @param host El contexto de ejecución de host
     */
    catch(exception: HttpException, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
      
      // Obtener status y respuesta de la excepción
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
  
      // Construir detalles del error
      let errorResponse: Record<string, any>;
      
      if (typeof exceptionResponse === 'object') {
        // Si la respuesta de la excepción es un objeto, mantener su estructura
        errorResponse = {
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
          ...(typeof exceptionResponse === 'object' ? exceptionResponse : { message: exceptionResponse }),
        };
      } else {
        // Si es una cadena u otro tipo, usarla como mensaje
        errorResponse = {
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
          message: exceptionResponse,
        };
      }
  
      // Registrar el error en los logs
      this.logError(request, exception, errorResponse);
  
      // Enviar respuesta al cliente
      response.status(status).json(errorResponse);
    }
  
    /**
     * Registra información detallada del error en los logs
     * @param request La solicitud HTTP
     * @param exception La excepción capturada
     * @param errorResponse La respuesta de error formateada
     */
    private logError(request: Request, exception: HttpException, errorResponse: Record<string, any>): void {
      const status = exception.getStatus();
      
      // Determinar nivel de log basado en la severidad
      if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(
          `${request.method} ${request.url}`,
          exception.stack,
          'HttpExceptionFilter',
        );
      } else if (status >= HttpStatus.BAD_REQUEST && status < HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.warn(
          `${request.method} ${request.url} - Error ${status}`,
          JSON.stringify(errorResponse),
          'HttpExceptionFilter',
        );
      } else {
        this.logger.log(
          `${request.method} ${request.url} - Error ${status}`,
          JSON.stringify(errorResponse),
          'HttpExceptionFilter',
        );
      }
    }
  }