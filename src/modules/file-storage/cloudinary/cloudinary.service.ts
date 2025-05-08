// src/modules/file-storage/cloudinary/cloudinary.service.ts
import { Injectable, Inject, Logger, BadRequestException } from '@nestjs/common';
import { v2 as cloudinaryType } from 'cloudinary';
import * as streamifier from 'streamifier';
import { CLOUDINARY } from './cloudinary.constants';
import { FileStorageService, UploadFileOptions } from '../interfaces/file-storage.interface';
import { UploadedFileDto } from '../dto/uploaded-file.dto';

@Injectable()
export class CloudinaryService implements FileStorageService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(
    @Inject(CLOUDINARY) private cloudinary: typeof cloudinaryType,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    options: UploadFileOptions = {},
  ): Promise<UploadedFileDto> {
    if (!file) {
      throw new BadRequestException('Archivo no proporcionado');
    }

    try {
      const uploadOptions = {
        folder: options.folder || 'resources',
        resource_type: options.resourceType || 'auto',
        public_id: options.publicId,
        tags: options.tags,
        overwrite: options.overwrite !== undefined ? options.overwrite : true,
        transformation: options.transformation,
      };

      return new Promise<UploadedFileDto>((resolve, reject) => {
        const uploadStream = this.cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              this.logger.error(`Error al subir archivo a Cloudinary: ${error.message}`);
              return reject(new BadRequestException(`Error al subir archivo: ${error.message}`));
            }
            
            // Verificar que result exista antes de acceder a sus propiedades
            if (!result) {
              return reject(new BadRequestException('No se recibió respuesta de Cloudinary'));
            }
            
            resolve({
              url: result.url,
              secureUrl: result.secure_url,
              publicId: result.public_id,
              assetId: result.asset_id,
              format: result.format,
              resourceType: result.resource_type,
              size: result.bytes,
              width: result.width,
              height: result.height,
              originalFilename: file.originalname,
              folder: result.folder,
              tags: result.tags,
              createdAt: new Date(result.created_at),
            });
          },
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
    } catch (error) {
      this.logger.error(`Error inesperado al subir archivo: ${error.message}`);
      throw new BadRequestException('Error al procesar archivo');
    }
  }

  async deleteFile(publicId: string): Promise<boolean> {
    if (!publicId) {
      throw new BadRequestException('ID público no proporcionado');
    }

    try {
      const result = await this.cloudinary.uploader.destroy(publicId);
      return result && result.result === 'ok';
    } catch (error) {
      this.logger.error(`Error al eliminar archivo de Cloudinary: ${error.message}`);
      throw new BadRequestException(`Error al eliminar archivo: ${error.message}`);
    }
  }

  async getFileDetails(publicId: string): Promise<any> {
    if (!publicId) {
      throw new BadRequestException('ID público no proporcionado');
    }

    try {
      const result = await this.cloudinary.api.resource(publicId);
      if (!result) {
        throw new BadRequestException('No se pudo obtener información del archivo');
      }
      return result;
    } catch (error) {
      this.logger.error(`Error al obtener detalles del archivo: ${error.message}`);
      throw new BadRequestException(`Error al obtener detalles del archivo: ${error.message}`);
    }
  }

  async createFolder(folderPath: string): Promise<any> {
    try {
      const result = await this.cloudinary.api.create_folder(folderPath);
      if (!result) {
        throw new BadRequestException('No se pudo crear la carpeta');
      }
      return result;
    } catch (error) {
      this.logger.error(`Error al crear carpeta en Cloudinary: ${error.message}`);
      throw new BadRequestException(`Error al crear carpeta: ${error.message}`);
    }
  }

  async listFolders(path?: string): Promise<any> {
    try {
      const result = await this.cloudinary.api.root_folders();
      if (!result) {
        throw new BadRequestException('No se pudieron listar las carpetas');
      }
      return result;
    } catch (error) {
      this.logger.error(`Error al listar carpetas: ${error.message}`);
      throw new BadRequestException(`Error al listar carpetas: ${error.message}`);
    }
  }

  async listResources(options: {
    type?: string;
    prefix?: string;
    maxResults?: number;
  } = {}): Promise<any> {
    try {
      const result = await this.cloudinary.api.resources({
        type: options.type || 'upload',
        prefix: options.prefix,
        max_results: options.maxResults || 10,
      });
      if (!result) {
        throw new BadRequestException('No se pudieron listar los recursos');
      }
      return result;
    } catch (error) {
      this.logger.error(`Error al listar recursos: ${error.message}`);
      throw new BadRequestException(`Error al listar recursos: ${error.message}`);
    }
  }

  getSignedUrl(publicId: string, options: {
    expiresAt?: number;
    transformation?: any;
  } = {}): string {
    if (!publicId) {
      throw new BadRequestException('ID público no proporcionado');
    }
    
    const timestamp = Math.round(new Date().getTime() / 1000);
    const expiresAt = options.expiresAt || timestamp + 3600; // Por defecto 1 hora

    return this.cloudinary.url(publicId, {
      secure: true,
      sign_url: true,
      transformation: options.transformation,
      expires_at: expiresAt,
    });
  }
}