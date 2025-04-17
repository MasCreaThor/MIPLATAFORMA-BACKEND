// Ruta: src/app.controller.ts

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Controlador principal de la aplicación
 * Proporciona endpoints básicos de información y estado
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Endpoint público que devuelve un mensaje de bienvenida
   * @returns Mensaje de bienvenida
   */
  @Get()
  getHello(): { message: string; timestamp: string } {
    return this.appService.getHello();
  }

  /**
   * Endpoint que verifica el estado del servidor
   * @returns Estado del servidor y de los servicios clave
   */
  @Get('health')
  getHealth(): Promise<Record<string, any>> {
    return this.appService.getHealth();
  }

  /**
   * Endpoint que devuelve información sobre la API
   * @returns Información sobre la API
   */
  @Get('info')
  getApiInfo(): Record<string, any> {
    return this.appService.getApiInfo();
  }
}