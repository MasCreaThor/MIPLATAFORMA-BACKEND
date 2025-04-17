// Ruta: src/common/interceptors/transform.interceptor.ts

import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
  
  /**
   * Interfaz para la respuesta estándar de la API
   */
  export interface Response<T> {
    data: T;
    meta?: Record<string, any>;
    statusCode: number;
    success: boolean;
    timestamp: string;
  }
  
  /**
   * Interceptor para estandarizar el formato de respuestas
   * Transforma todas las respuestas a un formato consistente
   */
  @Injectable()
  export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
    /**
     * Intercepta la respuesta y la transforma al formato estándar
     * @param context Contexto de ejecución
     * @param next Manejador para continuar la ejecución
     * @returns Observable con la respuesta transformada
     */
    intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
      // Obtener el contexto HTTP
      const ctx = context.switchToHttp();
      const response = ctx.getResponse();
      const request = ctx.getRequest();
      
      // Obtener el método HTTP de la solicitud
      const method = request.method;
      
      // Procesar y transformar la respuesta
      return next.handle().pipe(
        map((data) => {
          // Si la respuesta ya tiene el formato estándar, devolverla tal cual
          if (data && data.hasOwnProperty('success') && data.hasOwnProperty('statusCode')) {
            return data;
          }
          
          // Obtener el código de estado
          const statusCode = response.statusCode || 200;
          
          // Detectar si hay metadatos de paginación
          const meta = this.extractMeta(data);
          const responseData = this.extractData(data);
          
          // Construir la respuesta estándar
          return {
            data: responseData,
            ...(meta && Object.keys(meta).length > 0 ? { meta } : {}),
            statusCode,
            success: statusCode >= 200 && statusCode < 400,
            timestamp: new Date().toISOString(),
            path: request.url,
            method,
          };
        }),
      );
    }
  
    /**
     * Extrae metadatos de la respuesta si existen
     * @param data Datos de respuesta
     * @returns Objeto con metadatos
     */
    private extractMeta(data: any): Record<string, any> | undefined {
      // Si los datos incluyen propiedades de paginación, extraerlas como metadatos
      if (data && typeof data === 'object') {
        if (data.hasOwnProperty('items') && 
            (data.hasOwnProperty('total') || 
             data.hasOwnProperty('page') || 
             data.hasOwnProperty('limit') || 
             data.hasOwnProperty('pages'))) {
          
          const { items, ...meta } = data;
          return meta;
        }
        
        // Verificar si hay una propiedad 'meta' explícita
        if (data.hasOwnProperty('meta') && data.hasOwnProperty('data')) {
          return data.meta;
        }
      }
      
      return undefined;
    }
  
    /**
     * Extrae los datos principales de la respuesta
     * @param data Datos de respuesta
     * @returns Datos extraídos
     */
    private extractData(data: any): any {
      // Si los datos tienen un formato de paginación, extraer los items
      if (data && typeof data === 'object') {
        if (data.hasOwnProperty('items') && 
            (data.hasOwnProperty('total') || 
             data.hasOwnProperty('page') || 
             data.hasOwnProperty('limit') || 
             data.hasOwnProperty('pages'))) {
          
          return data.items;
        }
        
        // Verificar si hay una propiedad 'data' explícita
        if (data.hasOwnProperty('data') && data.hasOwnProperty('meta')) {
          return data.data;
        }
      }
      
      return data;
    }
  }