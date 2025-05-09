// src/modules/resources/resources.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Resource, ResourceDocument } from './schemas/resource.schema';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { FilterResourcesDto } from './dto/filter-resources.dto';
import { TagsService } from '../tags/tags.service';
import { ActivityService } from '../activity/activity.service';
import { ActivityAction, EntityType } from '../activity/schemas/activity.schema';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectModel(Resource.name) private resourceModel: Model<ResourceDocument>,
    private tagsService: TagsService,
    private activityService: ActivityService
  ) {}

  async create(createResourceDto: CreateResourceDto, peopleId: Types.ObjectId): Promise<Resource> {
    const createdResource = new this.resourceModel({
      ...createResourceDto,
      peopleId,
    });
    
    // Procesar las etiquetas si existen
    if (createResourceDto.tags && createResourceDto.tags.length > 0) {
      await this.processAndSaveTags(createResourceDto.tags, peopleId);
    }
    
    const savedResource = await createdResource.save();
    
    // Registrar la actividad
    await this.activityService.trackActivity(
      peopleId,
      ActivityAction.CREATE,
      EntityType.RESOURCE,
      savedResource._id as Types.ObjectId,
      {},
      savedResource.title,
      savedResource.tags || []
    );
    
    return savedResource;
  }

  async findAll(peopleId: Types.ObjectId, filterDto?: FilterResourcesDto): Promise<Resource[]> {
    const query: any = { peopleId };

    if (filterDto) {
      // Add filters if provided
      if (filterDto.search) {
        query.$or = [
          { title: { $regex: filterDto.search, $options: 'i' } },
          { description: { $regex: filterDto.search, $options: 'i' } },
          { content: { $regex: filterDto.search, $options: 'i' } },
        ];
      }

      if (filterDto.types && filterDto.types.length > 0) {
        query.type = { $in: filterDto.types };
      }

      if (filterDto.categoryId) {
        query.categoryId = filterDto.categoryId;
      }

      if (filterDto.tags && filterDto.tags.length > 0) {
        query.tags = { $in: filterDto.tags };
      }

      if (filterDto.isPublic !== undefined) {
        query.isPublic = filterDto.isPublic;
      }
    }

    return this.resourceModel.find(query).exec();
  }

  async findOne(id: string, peopleId: Types.ObjectId): Promise<Resource> {
    const resource = await this.resourceModel.findOne({ 
      _id: id, 
      peopleId 
    }).exec();
    
    if (!resource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }
    
    // Registrar la actividad de vista
    await this.activityService.trackActivity(
      peopleId,
      ActivityAction.VIEW,
      EntityType.RESOURCE,
      new Types.ObjectId(id),
      {},
      resource.title,
      resource.tags || []
    );
    
    return resource;
  }

  async update(id: string, updateResourceDto: UpdateResourceDto, peopleId: Types.ObjectId): Promise<Resource> {
    // Procesar las etiquetas si existen
    if (updateResourceDto.tags && updateResourceDto.tags.length > 0) {
      await this.processAndSaveTags(updateResourceDto.tags, peopleId);
    }
    
    const updatedResource = await this.resourceModel.findOneAndUpdate(
      { _id: id, peopleId },
      { $set: updateResourceDto },
      { new: true },
    ).exec();
    
    if (!updatedResource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }
    
    // Registrar la actividad
    await this.activityService.trackActivity(
      peopleId,
      ActivityAction.UPDATE,
      EntityType.RESOURCE,
      new Types.ObjectId(updatedResource._id as string),
      {},
      updatedResource.title,
      updatedResource.tags || []
    );
    
    return updatedResource;
  }

  async remove(id: string, peopleId: Types.ObjectId): Promise<Resource> {
    // Primero encontrar el recurso para tener la información antes de eliminarlo
    const resource = await this.findOne(id, peopleId);
    
    const deletedResource = await this.resourceModel.findOneAndDelete({ 
      _id: id, 
      peopleId 
    }).exec();
    
    if (!deletedResource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }
    
    // Registrar la actividad
    await this.activityService.trackActivity(
      peopleId,
      ActivityAction.DELETE,
      EntityType.RESOURCE,
      new Types.ObjectId(id),
      {}, 
      resource.title,
      resource.tags || []
    );
    
    return deletedResource;
  }

  async incrementUsageCount(id: string, peopleId: Types.ObjectId): Promise<Resource> {
    const resource = await this.resourceModel.findOneAndUpdate(
      { _id: id, peopleId },
      { $inc: { usageCount: 1 } },
      { new: true },
    ).exec();
    
    if (!resource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }
    
    return resource;
  }

  async findByCategory(categoryId: string, peopleId: Types.ObjectId): Promise<Resource[]> {
    return this.resourceModel.find({ 
      categoryId: new Types.ObjectId(categoryId), 
      peopleId 
    }).exec();
  }

  async findByTags(tags: string[], peopleId: Types.ObjectId): Promise<Resource[]> {
    return this.resourceModel.find({ 
      tags: { $in: tags }, 
      peopleId 
    }).exec();
  }

  async processAndSaveTags(tags: string[], peopleId: Types.ObjectId): Promise<void> {
    if (!tags || tags.length === 0) {
      return;
    }
    
    await this.tagsService.bulkCreateOrUpdate(tags, peopleId);
  }
}