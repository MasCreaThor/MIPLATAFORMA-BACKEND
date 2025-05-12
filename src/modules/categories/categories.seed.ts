// src/modules/categories/categories.seed.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CategoriesSeeder {
  private readonly logger = new Logger(CategoriesSeeder.name);
  private readonly systemUserId: Types.ObjectId;

  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    private configService: ConfigService,
  ) {
    // Obtener el ID de usuario del sistema desde la configuración
    // (Este ID debe ser configurado en las variables de entorno)
    const systemUserIdStr = this.configService.get<string>('SYSTEM_USER_ID');
    this.systemUserId = new Types.ObjectId(systemUserIdStr || '000000000000000000000000');
  }

  // Lista de categorías predefinidas del sistema
  private readonly systemCategories = [
    {
      name: 'Tecnología',
      description: 'Recursos y conocimientos relacionados con tecnología y desarrollo',
      color: '#3B82F6', // Azul
      icon: 'laptop',
      isSystem: true,
    },
    {
      name: 'Ciencias',
      description: 'Conocimientos científicos de diversas áreas',
      color: '#10B981', // Verde
      icon: 'flask',
      isSystem: true,
    },
    {
      name: 'Negocios',
      description: 'Información relacionada con gestión empresarial y negocios',
      color: '#F59E0B', // Amarillo
      icon: 'briefcase',
      isSystem: true,
    },
    {
      name: 'Artes',
      description: 'Recursos creativos y artísticos',
      color: '#EC4899', // Rosa
      icon: 'palette',
      isSystem: true,
    },
    {
      name: 'Educación',
      description: 'Material educativo y recursos de aprendizaje',
      color: '#8B5CF6', // Púrpura
      icon: 'book',
      isSystem: true,
    },
    {
      name: 'Salud',
      description: 'Información sobre salud y bienestar',
      color: '#EF4444', // Rojo
      icon: 'heart',
      isSystem: true,
    },
    {
      name: 'Personal',
      description: 'Categoría para contenido personal y misceláneo',
      color: '#6B7280', // Gris
      icon: 'user',
      isSystem: true,
    },
  ];

  /**
   * Siembra las categorías del sistema en la base de datos si no existen
   */
  async seed(): Promise<void> {
    this.logger.log('Iniciando la siembra de categorías del sistema...');
    
    for (const categoryData of this.systemCategories) {
      // Verificar si la categoría ya existe (por nombre y flag de sistema)
      const exists = await this.categoryModel.findOne({
        name: categoryData.name,
        isSystem: true,
      }).exec();
      
      if (!exists) {
        // Crear la categoría del sistema
        await this.categoryModel.create({
          ...categoryData,
          peopleId: this.systemUserId,
          isPublic: true, // Las categorías del sistema son públicas
        });
        this.logger.log(`Categoría del sistema creada: ${categoryData.name}`);
      } else {
        this.logger.log(`Categoría del sistema ya existe: ${categoryData.name}`);
      }
    }
    
    this.logger.log('Siembra de categorías del sistema completada');
  }
}