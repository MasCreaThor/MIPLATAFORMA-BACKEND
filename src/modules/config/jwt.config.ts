// Ruta: src/modules/config/jwt.config.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from './config.service';
import { JwtModuleOptions, JwtSignOptions } from '@nestjs/jwt';

/**
 * Servicio para la configuración de JWT
 * Proporciona opciones para el módulo JWT y operaciones relacionadas
 */
@Injectable()
export class JwtConfigService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Opciones para el módulo JWT
   * @returns Configuración para JwtModule.register/registerAsync
   */
  getJwtModuleOptions(): JwtModuleOptions {
    return {
      secret: this.getSecret(),
      signOptions: {
        expiresIn: this.getExpirationTime(),
      },
    };
  }

  /**
   * Obtiene la clave secreta para firmar tokens JWT
   * @returns Clave secreta para JWT
   */
  getSecret(): string {
    return this.configService.getString('JWT_SECRET');
  }

  /**
   * Obtiene el tiempo de expiración de tokens JWT
   * @returns Tiempo de expiración en segundos
   */
  getExpirationTime(): number {
    return this.configService.getNumber('JWT_EXPIRATION', 3600); // Default: 1 hora
  }

  /**
   * Obtiene el tiempo de expiración de tokens JWT de refresco
   * @returns Tiempo de expiración en segundos
   */
  getRefreshExpirationTime(): number {
    return this.configService.getNumber('JWT_REFRESH_EXPIRATION', 86400); // Default: 24 horas
  }

  /**
   * Opciones para firmar tokens JWT de acceso
   * @returns Opciones de firma para tokens de acceso
   */
  getAccessTokenOptions(): JwtSignOptions {
    return {
      secret: this.getSecret(),
      expiresIn: this.getExpirationTime(),
    };
  }

  /**
   * Opciones para firmar tokens JWT de refresco
   * @returns Opciones de firma para tokens de refresco
   */
  getRefreshTokenOptions(): JwtSignOptions {
    return {
      secret: this.getSecret(),
      expiresIn: this.getRefreshExpirationTime(),
    };
  }

  /**
   * Comprueba si los tokens de refresco están habilitados
   * @returns true si están habilitados, false en caso contrario
   */
  isRefreshEnabled(): boolean {
    return this.getRefreshExpirationTime() > 0;
  }

  /**
   * Opciones para verificar tokens JWT
   * @returns Opciones de verificación para tokens JWT
   */
  getVerifyOptions(): any {
    return {
      secret: this.getSecret(),
    };
  }
}