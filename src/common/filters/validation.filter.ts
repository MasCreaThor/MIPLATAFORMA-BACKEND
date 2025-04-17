// Ruta: src/common/filters/validation.filter.ts

import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpStatus,
    Logger,
    BadRequestException,
  } from '@nestjs/common';
  import { Request, Response } from 'express';
  import { ValidationError } from 'class-validator';
  
  /**
   * Filtro especializado para capturar y formatear errores de validación
   * Mejora el formato de los errores de validación para facilitar su uso en el cliente
   */
  @Catch(BadRequestException)
  export class ValidationFilter implements ExceptionFilter {
    private readonly logger = new Logger(ValidationFilter.name);
  
    /**
     * Método que captura y procesa excepciones de validación
     * @param exception La excepción de validación capturada
     * @param host El contexto de ejecución de host
     */
    catch(exception: BadRequestException, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
      
      // Obtener detalles de la excepción
      const status = HttpStatus.BAD_REQUEST;
      const exceptionResponse = exception.getResponse() as any;
      
      // Verificar si es un error de validación con estructura específica
      if (exceptionResponse && 
          (typeof exceptionResponse === 'object') && 
          (exceptionResponse.statusCode === 400 || exceptionResponse.statusCode === undefined) && 
          (Array.isArray(exceptionResponse.message) || exceptionResponse.errors)) {
        
        // Formatear errores de validación
        const validationErrors = this.formatValidationErrors(
          Array.isArray(exceptionResponse.message) 
            ? exceptionResponse.message 
            : exceptionResponse.errors
        );
        
        // Construir respuesta formateada
        const errorResponse = {
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
          errors: validationErrors,
          message: 'Validation failed',
        };
        
        // Registrar el error
        this.logger.warn(
          `Validation error: ${request.method} ${request.url}`,
          JSON.stringify(errorResponse),
          'ValidationFilter',
        );
        
        response.status(status).json(errorResponse);
      } else {
        // Si no es un error de validación, mantener el formato original
        const errorResponse = {
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
          message: typeof exceptionResponse.message === 'object' 
            ? exceptionResponse.message 
            : [exceptionResponse.message],
        };
        
        this.logger.warn(
          `Bad request: ${request.method} ${request.url}`,
          JSON.stringify(errorResponse),
          'ValidationFilter',
        );
        
        response.status(status).json(errorResponse);
      }
    }
  
    /**
     * Formatea los errores de validación para una mejor presentación
     * @param validationErrors Lista de errores de validación
     * @returns Objeto con errores formateados por campo
     */
    private formatValidationErrors(validationErrors: ValidationError[] | string[]): Record<string, string[]> {
      // Si son strings simples, retornar como errores generales
      if (validationErrors.length > 0 && typeof validationErrors[0] === 'string') {
        return { 
          general: validationErrors as string[] 
        };
      }
  
      // Si son errores de validación estructurados, procesarlos
      const formattedErrors: Record<string, string[]> = {};
      
      const addError = (property: string, message: string) => {
        if (!formattedErrors[property]) {
          formattedErrors[property] = [];
        }
        formattedErrors[property].push(message);
      };
      
      const processValidationError = (error: ValidationError, prefix = '') => {
        const property = prefix ? `${prefix}.${error.property}` : error.property;
        
        // Agregar constraints directos
        if (error.constraints) {
          Object.values(error.constraints).forEach(message => {
            addError(property, message);
          });
        }
        
        // Procesar errores anidados
        if (error.children && error.children.length > 0) {
          error.children.forEach(child => {
            processValidationError(child, property);
          });
        }
      };
      
      // Procesar todos los errores
      (validationErrors as ValidationError[]).forEach(error => {
        processValidationError(error);
      });
      
      return formattedErrors;
    }
  }