// src/modules/file-storage/cloudinary/cloudinary.provider.ts
import { Provider } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY, CLOUDINARY_CONFIG } from './cloudinary.constants';
import { CloudinaryConfigOptions } from './cloudinary-config.interface';

export const CloudinaryProvider: Provider = {
  provide: CLOUDINARY,
  useFactory: (config: CloudinaryConfigOptions) => {
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
      secure: config.secure !== undefined ? config.secure : true,
    });
    return cloudinary;
  },
  inject: [CLOUDINARY_CONFIG],
};