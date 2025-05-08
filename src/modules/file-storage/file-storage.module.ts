// src/modules/file-storage/file-storage.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { FileUploadController } from './file-upload.controller';

@Module({
  imports: [
    CloudinaryModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Obtenemos las variables de entorno y verificamos que no sean undefined
        const cloudName = configService.get<string>('CLOUDINARY_CLOUD_NAME');
        const apiKey = configService.get<string>('CLOUDINARY_API_KEY');
        const apiSecret = configService.get<string>('CLOUDINARY_API_SECRET');
        
        // Validar que las variables de entorno requeridas estén definidas
        if (!cloudName) {
          throw new Error('Variable de entorno CLOUDINARY_CLOUD_NAME no está definida');
        }
        if (!apiKey) {
          throw new Error('Variable de entorno CLOUDINARY_API_KEY no está definida');
        }
        if (!apiSecret) {
          throw new Error('Variable de entorno CLOUDINARY_API_SECRET no está definida');
        }
        
        // Devolver la configuración con tipos explícitos
        return {
          cloudName,
          apiKey,
          apiSecret,
          secure: true,
        };
      },
      inject: [ConfigService],
      isGlobal: true,
    }),
  ],
  controllers: [FileUploadController],
  exports: [CloudinaryModule],
})
export class FileStorageModule {}