// src/modules/file-storage/cloudinary/cloudinary-config.interface.ts
export interface CloudinaryConfigOptions {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
    secure?: boolean;
  }
  
  export interface CloudinaryModuleOptions {
    config: CloudinaryConfigOptions;
    isGlobal?: boolean;
  }