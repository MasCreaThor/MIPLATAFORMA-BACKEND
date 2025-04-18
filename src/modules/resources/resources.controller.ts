// src/modules/resources/resources.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { ResourcesService } from './resources.service';
  import { CreateResourceDto } from './dto/create-resource.dto';
  import { UpdateResourceDto } from './dto/update-resource.dto';
  import { FilterResourcesDto } from './dto/filter-resources.dto';
  import { Types } from 'mongoose';
  import { CloudinaryService } from '../file-storage/cloudinary/cloudinary.service';
  import { ResourceType } from './schemas/resource.schema';
  
  @Controller('resources')
  export class ResourcesController {
    constructor(
      private readonly resourcesService: ResourcesService,
      private readonly cloudinaryService: CloudinaryService,
    ) {}
  
    @Post()
    create(@Body() createResourceDto: CreateResourceDto) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.resourcesService.create(createResourceDto, mockPeopleId);
    }
  
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadResource(
      @UploadedFile() file: Express.Multer.File,
      @Body() createResourceDto: CreateResourceDto,
    ) {
      if (!file) {
        throw new BadRequestException('No se ha proporcionado ningún archivo');
      }
  
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
  
      // Determinar el tipo de recurso basado en la extensión del archivo
      const mimeTypeToResourceType = {
        'application/pdf': ResourceType.DOCUMENTATION,
        'text/plain': ResourceType.DOCUMENTATION,
        'image/jpeg': ResourceType.DOCUMENTATION,
        'image/png': ResourceType.DOCUMENTATION,
        'video/mp4': ResourceType.VIDEO,
      };
  
      // Usar el tipo proporcionado o inferir del mimetype
      const resourceType = createResourceDto.type || 
          mimeTypeToResourceType[file.mimetype] || 
          ResourceType.FILE;
  
      // Determinar la carpeta en Cloudinary basada en el tipo de recurso
      const folderMap = {
        [ResourceType.DOCUMENTATION]: 'documentation',
        [ResourceType.TUTORIAL]: 'tutorials',
        [ResourceType.LINK]: 'links',
        [ResourceType.FILE]: 'files',
        [ResourceType.VIDEO]: 'videos',
      };
  
      const folder = folderMap[resourceType];
  
      // Subir archivo a Cloudinary
      const uploadedFile = await this.cloudinaryService.uploadFile(file, {
        folder,
        tags: createResourceDto.tags,
      });
  
      // Crear el recurso con la información del archivo
      const resource = await this.resourcesService.create(
        {
          ...createResourceDto,
          type: resourceType,
          url: uploadedFile.secureUrl,
          filePath: uploadedFile.publicId,
          fileSize: uploadedFile.size,
          fileType: file.mimetype,
          thumbnailUrl: resourceType === ResourceType.VIDEO ? 
            uploadedFile.secureUrl.replace('/video/', '/image/').replace(/\.[^/.]+$/, ".jpg") : 
            (resourceType === ResourceType.DOCUMENTATION ? uploadedFile.secureUrl : undefined),
        },
        mockPeopleId,
      );
  
      return {
        resource,
        file: uploadedFile,
      };
    }
  
    @Get()
    findAll(@Query() filterDto: FilterResourcesDto) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.resourcesService.findAll(mockPeopleId, filterDto);
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.resourcesService.findOne(id, mockPeopleId);
    }
  
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateResourceDto: UpdateResourceDto) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.resourcesService.update(id, updateResourceDto, mockPeopleId);
    }
  
    @Delete(':id')
    async remove(@Param('id') id: string) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      
      // Primero obtener el recurso para conseguir el publicId de Cloudinary
      const resource = await this.resourcesService.findOne(id, mockPeopleId);
      
      // Si el recurso tiene un archivo asociado, eliminarlo de Cloudinary
      if (resource.filePath) {
        await this.cloudinaryService.deleteFile(resource.filePath);
      }
      
      // Eliminar el recurso de la base de datos
      return this.resourcesService.remove(id, mockPeopleId);
    }
  
    @Post(':id/increment-usage')
    incrementUsage(@Param('id') id: string) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.resourcesService.incrementUsageCount(id, mockPeopleId);
    }
  
    @Get('by-category/:categoryId')
    findByCategory(@Param('categoryId') categoryId: string) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.resourcesService.findByCategory(categoryId, mockPeopleId);
    }
  
    @Get('by-tags')
    findByTags(@Query('tags') tags: string[]) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.resourcesService.findByTags(tags, mockPeopleId);
    }
  }