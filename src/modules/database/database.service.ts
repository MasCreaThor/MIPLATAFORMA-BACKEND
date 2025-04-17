// Ruta: src/modules/database/database.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { MongoService } from './mongo/mongo.service';

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly mongoService: MongoService,
  ) {}

  async onModuleInit() {
    try {
      // Verificar la conexión a la base de datos al iniciar el módulo
      const status = await this.checkConnection();
      if (status) {
        console.log('Database connection validated successfully on startup');
      }
    } catch (error) {
      console.error('Error validating database connection on startup:', error);
    }
  }

  /**
   * Verifica si la conexión a la base de datos está activa
   * @returns {Promise<boolean>} Estado de la conexión
   */
  async checkConnection(): Promise<boolean> {
    try {
      const state = this.connection.readyState;
      return state === 1; // 1 significa 'connected'
    } catch (error) {
      console.error('Error checking database connection:', error);
      return false;
    }
  }

  /**
   * Obtiene la instancia de conexión actual de MongoDB
   * @returns {Connection} La conexión a MongoDB
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Obtiene el nombre de la base de datos
   * @returns {string} Nombre de la base de datos
   */
  getDatabaseName(): string {
    if (!this.connection.db) {
      throw new Error('Database connection not established');
    }
    return this.connection.db.databaseName;
  }

  /**
   * Obtiene los nombres de todas las colecciones en la base de datos
   * @returns {Promise<string[]>} Lista de nombres de colecciones
   */
  async getCollections(): Promise<string[]> {
    try {
      if (!this.connection.db) {
        throw new Error('Database connection not established');
      }
      
      const collections = await this.connection.db.listCollections().toArray();
      return collections.map(collection => collection.name);
    } catch (error) {
      console.error('Error getting collections:', error);
      throw error;
    }
  }

  /**
   * Ejecuta una operación de ping para verificar la respuesta de la base de datos
   * @returns {Promise<boolean>} Resultado de la operación de ping
   */
  async ping(): Promise<boolean> {
    try {
      if (!this.connection.db) {
        return false;
      }
      
      const result = await this.connection.db.admin().ping();
      return result && result.ok === 1;
    } catch (error) {
      console.error('Error pinging database:', error);
      return false;
    }
  }

  /**
   * Cierra la conexión a la base de datos de forma segura
   * @returns {Promise<void>}
   */
  async closeConnection(): Promise<void> {
    try {
      if (this.connection) {
        await this.connection.close();
        console.log('Database connection closed successfully');
      }
    } catch (error) {
      console.error('Error closing database connection:', error);
      throw error;
    }
  }
}