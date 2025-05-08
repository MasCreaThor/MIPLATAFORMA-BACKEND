// Ruta: src/common/utils/pagination.util.ts

/**
 * Interfaz para opciones de paginación
 */
export interface PaginationOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
  
  /**
   * Interfaz para el resultado paginado
   */
  export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }
  
  /**
   * Clase de utilidad para manejar paginación
   */
  export class PaginationUtil {
    /**
     * Valida y normaliza las opciones de paginación
     * @param options Opciones de paginación a validar
     * @returns Opciones de paginación normalizadas
     */
    static validatePaginationOptions(options: PaginationOptions): PaginationOptions {
      const validatedOptions: PaginationOptions = {
        page: 1,
        limit: 10,
        sortOrder: 'desc',
      };
  
      // Validar página
      if (options.page !== undefined) {
        const page = Number(options.page);
        validatedOptions.page = Number.isInteger(page) && page > 0 ? page : 1;
      }
  
      // Validar límite
      if (options.limit !== undefined) {
        const limit = Number(options.limit);
        validatedOptions.limit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 100) : 10;
      }
  
      // Validar campo de ordenación
      if (options.sortBy) {
        validatedOptions.sortBy = options.sortBy;
      }
  
      // Validar dirección de ordenación
      if (options.sortOrder && ['asc', 'desc'].includes(options.sortOrder)) {
        validatedOptions.sortOrder = options.sortOrder;
      }
  
      return validatedOptions;
    }
  
    /**
     * Calcula el número de elementos a saltar para paginación
     * @param page Número de página
     * @param limit Elementos por página
     * @returns Número de elementos a saltar
     */
    static calculateSkip(page: number, limit: number): number {
      return (page - 1) * limit;
    }
  
    /**
     * Crea un objeto de ordenación para MongoDB
     * @param sortBy Campo para ordenar
     * @param sortOrder Dirección de ordenación
     * @returns Objeto de ordenación
     */
    static createSortObject(sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc'): Record<string, 1 | -1> {
      if (!sortBy) {
        // Por defecto ordenar por fecha de creación descendente
        return { createdAt: -1 };
      }
  
      return {
        [sortBy]: sortOrder === 'asc' ? 1 : -1,
      };
    }
  
    /**
     * Formatea un resultado paginado
     * @param items Elementos para la página actual
     * @param total Total de elementos
     * @param options Opciones de paginación
     * @returns Resultado paginado formateado
     */
    static createPaginatedResponse<T>(
      items: T[],
      total: number,
      options: PaginationOptions,
    ): PaginatedResult<T> {
      const { page = 1, limit = 10 } = options;
      const totalPages = Math.ceil(total / limit);
  
      return {
        items,
        total,
        page,
        limit,
        pages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };
    }
  
    /**
     * Crea un objeto para respuesta de paginación para API
     * @param paginatedResult Resultado paginado
     * @returns Objeto para respuesta de API
     */
    static createPaginationLinks<T>(
      paginatedResult: PaginatedResult<T>,
      baseUrl: string,
    ): Record<string, string> {
      const { page, limit, pages } = paginatedResult;
      const links: Record<string, string> = {};
  
      // URL base limpia
      const url = baseUrl.includes('?')
        ? baseUrl.split('?')[0]
        : baseUrl;
  
      // Generar links
      links.first = `${url}?page=1&limit=${limit}`;
      links.last = `${url}?page=${pages}&limit=${limit}`;
  
      if (paginatedResult.hasPrevPage) {
        links.prev = `${url}?page=${page - 1}&limit=${limit}`;
      }
  
      if (paginatedResult.hasNextPage) {
        links.next = `${url}?page=${page + 1}&limit=${limit}`;
      }
  
      return links;
    }
  }