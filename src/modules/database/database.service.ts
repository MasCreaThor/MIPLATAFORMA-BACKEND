import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  onModuleInit() {
    this.logger.log('Database connection initialized');
  }

  getConnection(): Connection {
    return this.connection;
  }

  async checkConnection(): Promise<boolean> {
    try {
      return this.connection.readyState === 1;
    } catch (error) {
      this.logger.error('Database connection check failed', error);
      return false;
    }
  }

  async healthCheck(): Promise<boolean> {
    return this.checkConnection();
  }

  async ping(): Promise<boolean> {
    try {
      // Intentamos ejecutar el comando ping en MongoDB
      if (this.connection.db && this.connection.db.admin) {
        await this.connection.db.admin().ping();
      }
      return true;
    } catch (error) {
      this.logger.error('Database ping failed', error);
      return false;
    }
  }
}