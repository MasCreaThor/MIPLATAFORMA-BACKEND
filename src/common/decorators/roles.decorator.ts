// Ruta: src/common/decorators/roles.decorator.ts

import { SetMetadata } from '@nestjs/common';

/**
 * Clave para metadata de roles
 */
export const ROLES_KEY = 'roles';

/**
 * Decorador para especificar roles requeridos para un endpoint
 * @param roles Lista de roles que pueden acceder al endpoint
 * @returns Decorador configurado
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);