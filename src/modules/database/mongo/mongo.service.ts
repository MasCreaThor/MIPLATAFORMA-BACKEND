// Ruta: src/modules/database/mongo/mongo.service.ts

import { Injectable, Inject } from '@nestjs/common';
import { Connection, Model, Document, FilterQuery, UpdateQuery } from 'mongoose';
import { DATABASE_CONNECTION } from '../database.providers';

@Injectable()
export class MongoService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly connection: Connection,
  ) {}

  /**
   * Obtiene un modelo de Mongoose para una colección específica
   * @param name Nombre del modelo/colección
   * @param schema Esquema del modelo
   * @returns Modelo de Mongoose
   */
  getModel<T extends Document>(name: string, schema: any): Model<T> {
    return this.connection.model<T>(name, schema);
  }

  /**
   * Crea un documento en la colección
   * @param model Modelo de Mongoose
   * @param data Datos para crear el documento
   * @returns El documento creado
   */
  async create<T extends Document>(model: Model<T>, data: any): Promise<T> {
    try {
      const newDocument = new model(data);
      return await newDocument.save();
    } catch (error) {
      console.error(`Error creating document in ${model.modelName}:`, error);
      throw error;
    }
  }

  /**
   * Encuentra documentos que coinciden con un filtro
   * @param model Modelo de Mongoose
   * @param filter Filtro para la búsqueda
   * @returns Lista de documentos encontrados
   */
  async find<T extends Document>(model: Model<T>, filter: FilterQuery<T> = {}): Promise<T[]> {
    try {
      return await model.find(filter).exec();
    } catch (error) {
      console.error(`Error finding documents in ${model.modelName}:`, error);
      throw error;
    }
  }

  /**
   * Encuentra un documento por su ID
   * @param model Modelo de Mongoose
   * @param id ID del documento
   * @returns El documento encontrado o null
   */
  async findById<T extends Document>(model: Model<T>, id: string): Promise<T | null> {
    try {
      return await model.findById(id).exec();
    } catch (error) {
      console.error(`Error finding document by ID in ${model.modelName}:`, error);
      throw error;
    }
  }

  /**
   * Encuentra un único documento que coincide con un filtro
   * @param model Modelo de Mongoose
   * @param filter Filtro para la búsqueda
   * @returns El documento encontrado o null
   */
  async findOne<T extends Document>(model: Model<T>, filter: FilterQuery<T>): Promise<T | null> {
    try {
      return await model.findOne(filter).exec();
    } catch (error) {
      console.error(`Error finding document in ${model.modelName}:`, error);
      throw error;
    }
  }

  /**
   * Actualiza un documento por su ID
   * @param model Modelo de Mongoose
   * @param id ID del documento
   * @param updateData Datos para actualizar
   * @returns El documento actualizado
   */
  async updateById<T extends Document>(
    model: Model<T>,
    id: string,
    updateData: UpdateQuery<T>,
  ): Promise<T | null> {
    try {
      return await model.findByIdAndUpdate(id, updateData, { new: true }).exec();
    } catch (error) {
      console.error(`Error updating document in ${model.modelName}:`, error);
      throw error;
    }
  }

  /**
   * Elimina un documento por su ID
   * @param model Modelo de Mongoose
   * @param id ID del documento
   * @returns El documento eliminado o null
   */
  async deleteById<T extends Document>(model: Model<T>, id: string): Promise<T | null> {
    try {
      return await model.findByIdAndDelete(id).exec();
    } catch (error) {
      console.error(`Error deleting document in ${model.modelName}:`, error);
      throw error;
    }
  }

  /**
   * Cuenta los documentos que coinciden con un filtro
   * @param model Modelo de Mongoose
   * @param filter Filtro para el conteo
   * @returns Número de documentos encontrados
   */
  async count<T extends Document>(model: Model<T>, filter: FilterQuery<T> = {}): Promise<number> {
    try {
      return await model.countDocuments(filter).exec();
    } catch (error) {
      console.error(`Error counting documents in ${model.modelName}:`, error);
      throw error;
    }
  }

  /**
   * Realiza una búsqueda paginada
   * @param model Modelo de Mongoose
   * @param filter Filtro para la búsqueda
   * @param page Número de página
   * @param limit Límite de resultados por página
   * @param sort Campos para ordenar los resultados
   * @returns Objeto con resultados paginados
   */
  async paginate<T extends Document>(
    model: Model<T>,
    filter: FilterQuery<T> = {},
    page = 1,
    limit = 10,
    sort: any = { createdAt: -1 },
  ): Promise<{ items: T[]; total: number; page: number; limit: number; pages: number }> {
    try {
      const skip = (page - 1) * limit;
      const total = await model.countDocuments(filter).exec();
      const items = await model.find(filter).sort(sort).skip(skip).limit(limit).exec();
      
      return {
        items,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error(`Error paginating documents in ${model.modelName}:`, error);
      throw error;
    }
  }
}