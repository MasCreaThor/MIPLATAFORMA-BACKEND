import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): Promise<string> {
    return this.appService.getHello();
  }

  @Get('health')
  getHealthCheck() {
    return this.appService.getHealthCheck();
  }
  
  // Ruta para la raíz del sitio (sin prefijo de API)
  @Get('')
  root(@Res() res: Response) {
    res.status(200).json({
      message: 'Sistema de Gestión Personal de Conocimiento API',
      version: '1.0.0',
      endpoints: {
        api: '/api',
        health: '/api/health',
        auth: {
          register: '/api/auth/register',
          login: '/api/auth/login',
          profile: '/api/auth/profile',
        }
      }
    });
  }
}