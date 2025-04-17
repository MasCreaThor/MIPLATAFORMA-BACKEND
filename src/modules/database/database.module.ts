// Ruta: src/modules/database/database.module.ts

import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { MongoService } from './mongo/mongo.service';
import { databaseProviders } from './database.providers';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        
        if (!uri) {
          throw new Error('MONGODB_URI is not defined in environment variables');
        }
        
        return {
          uri: uri,
          // Eliminamos las opciones obsoletas useNewUrlParser y useUnifiedTopology
          // Eliminamos connectionName que no es soportada
          connectionFactory: (connection) => {
            connection.on('connected', () => {
              console.log('MongoDB connection established successfully');
            });
            connection.on('error', (error) => {
              console.error('MongoDB connection error:', error);
            });
            connection.on('disconnected', () => {
              console.log('MongoDB disconnected');
            });
            return connection;
          },
        };
      },
    }),
  ],
  providers: [
    ...databaseProviders,
    DatabaseService,
    MongoService,
  ],
  exports: [
    DatabaseService,
    MongoService,
    ...databaseProviders,
  ],
})
export class DatabaseModule {}