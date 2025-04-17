// Ruta: src/modules/database/database.providers.ts

import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mongoose from 'mongoose';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

/**
 * Proveedores para la conexión a la base de datos MongoDB
 * Se proporciona la conexión principal que será inyectada donde se necesite
 */
export const databaseProviders: Provider[] = [
  {
    provide: DATABASE_CONNECTION,
    inject: [ConfigService],
    useFactory: async (configService: ConfigService): Promise<typeof mongoose> => {
      try {
        // Obtener URI y proporcionar un fallback en caso de que sea undefined
        const uri = configService.get<string>('MONGODB_URI');
        
        if (!uri) {
          throw new Error('MONGODB_URI is not defined in environment variables');
        }
        
        // Opciones para la conexión a MongoDB
        // Eliminamos opciones obsoletas useNewUrlParser y useUnifiedTopology
        const options = {
          connectTimeoutMS: configService.get<number>('MONGODB_CONNECT_TIMEOUT', 5000),
          socketTimeoutMS: configService.get<number>('MONGODB_SOCKET_TIMEOUT', 30000),
        };

        // Crear la conexión a MongoDB
        const connection = await mongoose.connect(uri, options);
        
        // Verificar que connection.connection.db existe antes de acceder a databaseName
        if (connection.connection.db) {
          console.log(`MongoDB connected to database: ${connection.connection.db.databaseName}`);
        } else {
          console.log('MongoDB connected successfully');
        }
        
        // Manejar eventos de conexión
        connection.connection.on('error', (error) => {
          console.error('MongoDB connection error:', error);
        });
        
        connection.connection.on('disconnected', () => {
          console.log('MongoDB disconnected');
        });

        // Manejar el cierre de la aplicación para cerrar la conexión correctamente
        process.on('SIGINT', async () => {
          await connection.connection.close();
          console.log('MongoDB connection closed through app termination');
          process.exit(0);
        });

        return connection;
      } catch (error) {
        console.error('Error establishing MongoDB connection:', error);
        throw error;
      }
    },
  },
];