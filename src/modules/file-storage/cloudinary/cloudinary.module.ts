// src/modules/file-storage/cloudinary/cloudinary.module.ts
import { Module, DynamicModule, Provider, Global } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryProvider } from './cloudinary.provider';
import { CLOUDINARY_CONFIG } from './cloudinary.constants';
import { CloudinaryModuleOptions, CloudinaryConfigOptions } from './cloudinary-config.interface';

@Module({})
export class CloudinaryModule {
  static register(options: CloudinaryModuleOptions): DynamicModule {
    const configProvider: Provider = {
      provide: CLOUDINARY_CONFIG,
      useValue: options.config,
    };

    const module: DynamicModule = {
      module: CloudinaryModule,
      providers: [CloudinaryProvider, configProvider, CloudinaryService],
      exports: [CloudinaryService],
    };

    if (options.isGlobal) {
      module.global = true;
    }

    return module;
  }

  static registerAsync(options: {
    imports?: any[];
    useFactory: (...args: any[]) => CloudinaryConfigOptions | Promise<CloudinaryConfigOptions>;
    inject?: any[];
    isGlobal?: boolean;
  }): DynamicModule {
    const configProvider: Provider = {
      provide: CLOUDINARY_CONFIG,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    const module: DynamicModule = {
      module: CloudinaryModule,
      imports: options.imports || [],
      providers: [CloudinaryProvider, configProvider, CloudinaryService],
      exports: [CloudinaryService],
    };

    if (options.isGlobal) {
      module.global = true;
    }

    return module;
  }
}