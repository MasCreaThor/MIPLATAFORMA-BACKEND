// src/modules/file-storage/file-upload.controller.ts
import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    Body,
    Delete,
    Param,
    Get,
    Query,
    BadRequestException,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { CloudinaryService } from './cloudinary/cloudinary.service';
  import { UploadedFileDto } from './dto/uploaded-file.dto';
  import { UploadFileOptions } from './interfaces/file-storage.interface';
  
  @Controller('files')
  export class FileUploadController {
    constructor(private readonly cloudinaryService: CloudinaryService) {}
  
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
      @UploadedFile() file: Express.Multer.File,
      @Body() options: UploadFileOptions,
    ): Promise<UploadedFileDto> {
      if (!file) {
        throw new BadRequestException('No se ha proporcionado ningún archivo');
      }
      return this.cloudinaryService.uploadFile(file, options);
    }
  
    @Delete(':publicId')
    async deleteFile(@Param('publicId') publicId: string): Promise<{ success: boolean }> {
      const result = await this.cloudinaryService.deleteFile(publicId);
      return { success: result };
    }
  
    @Get(':publicId')
    async getFileDetails(@Param('publicId') publicId: string): Promise<any> {
      return this.cloudinaryService.getFileDetails(publicId);
    }
  
    @Get('list/resources')
    async listResources(
      @Query('type') type?: string,
      @Query('prefix') prefix?: string,
      @Query('maxResults') maxResults?: number,
    ): Promise<any> {
      return this.cloudinaryService.listResources({
        type,
        prefix,
        maxResults: maxResults ? parseInt(maxResults.toString(), 10) : undefined,
      });
    }
  
    @Get('signed-url/:publicId')
    getSignedUrl(
      @Param('publicId') publicId: string,
      @Query('expiresAt') expiresAt?: number,
    ): { signedUrl: string } {
      const signedUrl = this.cloudinaryService.getSignedUrl(publicId, {
        expiresAt: expiresAt ? parseInt(expiresAt.toString(), 10) : undefined,
      });
      return { signedUrl };
    }
  }