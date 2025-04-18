// src/modules/file-storage/dto/uploaded-file.dto.ts
export class UploadedFileDto {
    url: string;
    secureUrl: string;
    publicId: string;
    assetId?: string;
    format?: string;
    resourceType?: string;
    size?: number;
    width?: number;
    height?: number;
    originalFilename?: string;
    folder?: string;
    tags?: string[];
    createdAt?: Date;
  }