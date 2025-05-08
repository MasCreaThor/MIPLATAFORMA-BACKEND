// Ruta: src/common/pipes/validation.pipe.ts

import {
    PipeTransform,
    Injectable,
    ArgumentMetadata,
    BadRequestException,
    Logger,
  } from '@nestjs/common';
  import { validate } from 'class-validator';
  import { plainToInstance } from 'class-transformer';
  
  /**
   * Pipe personalizado para validación de datos
   * Valida los datos de entrada contra DTOs usando class-validator
   */
  @Injectable()
  export class ValidationPipe implements PipeTransform<any> {
    private readonly logger = new Logger(ValidationPipe.name);
  
    /**
     * Transforma y valida los datos de entrada
     * @param value Valor a transformar y validar
     * @param metadata Metadatos del argumento
     * @returns Valor transformado y validado
     */
    async transform(value: any, metadata: ArgumentMetadata) {
      const { metatype, type } = metadata;
      
      // Si no hay tipo o el tipo es nativo, devolver el valor sin validar
      if (!metatype || !this.toValidate(metatype)) {
        return value;
      }
  
      // Verificar si hay datos para validar
      if (value === null || value === undefined) {
        // Si el valor es null o undefined, determinar si debemos lanzar error
        // Esta lógica se puede personalizar según las necesidades
        if (['body', 'query', 'param'].includes(type)) {
          throw new BadRequestException(`Validation failed: No data provided for ${type}`);
        }
        return value;
      }
  
      // Transformar el valor plano a una instancia de la clase
      const object = plainToInstance(metatype, value, {
        enableImplicitConversion: true,
        excludeExtraneousValues: false,
      });
  
      // Validar la instancia
      const errors = await validate(object, {
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
        skipMissingProperties: false,
      });
  
      // Si hay errores, lanzar excepción
      if (errors.length > 0) {
        this.logger.warn(
          `Validation failed: ${JSON.stringify(errors)}`,
          'ValidationPipe',
        );
        
        throw new BadRequestException({
          message: 'Validation failed',
          errors,
        });
      }
  
      return object;
    }
  
    /**
     * Verifica si el tipo debe ser validado
     * @param metatype Tipo a verificar
     * @returns true si debe validarse, false en caso contrario
     */
    private toValidate(metatype: any): boolean {
      const types: any[] = [String, Boolean, Number, Array, Object];
      return !types.includes(metatype);
    }
  }