// Ruta: src/common/decorators/public.decorator.ts

import { SetMetadata } from '@nestjs/common';

/**
 * Clave para metadata de rutas públicas
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorador para marcar un endpoint como público
 * Exime al endpoint de la autenticación JWT
 * @returns Decorador configurado
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);