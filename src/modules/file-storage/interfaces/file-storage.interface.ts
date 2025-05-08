// src/modules/file-storage/interfaces/file-storage.interface.ts
import { UploadedFileDto } from '../dto/uploaded-file.dto';

export interface FileStorageService {
  uploadFile(
    file: Express.Multer.File,
    options?: UploadFileOptions,
  ): Promise<UploadedFileDto>;
  deleteFile(publicId: string): Promise<boolean>;
  getFileDetails(publicId: string): Promise<any>;
}

export interface UploadFileOptions {
  folder?: string;
  tags?: string[];
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  publicId?: string;
  overwrite?: boolean;
  transformation?: any;
}