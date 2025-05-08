// Ruta: src/common/guards/roles.guard.ts

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

/**
 * Guardia para verificar roles de usuario
 * Controla el acceso a endpoints basado en los roles del usuario
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Determina si una solicitud está autorizada
   * @param context Contexto de ejecución
   * @returns true si la solicitud está autorizada, false en caso contrario
   */
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Obtener roles requeridos para el endpoint
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Obtener el usuario de la solicitud
    const { user } = context.switchToHttp().getRequest();

    // Verificar si el usuario existe y tiene la propiedad roles
    if (!user || !user.roles) {
      return false;
    }

    // Verificar si el usuario tiene al menos uno de los roles requeridos
    const hasRole = () => requiredRoles.some(role => user.roles.includes(role));

    if (!hasRole()) {
      throw new ForbiddenException(
        `Access denied: Required role(s): ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}