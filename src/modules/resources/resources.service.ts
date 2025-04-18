// src/modules/resources/resources.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Resource, ResourceDocument } from './schemas/resource.schema';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { FilterResourcesDto } from './dto/filter-resources.dto';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectModel(Resource.name) private resourceModel: Model<ResourceDocument>,
  ) {}

  async create(createResourceDto: CreateResourceDto, peopleId: Types.ObjectId): Promise<Resource> {
    const createdResource = new this.resourceModel({
      ...createResourceDto,
      peopleId,
    });
    return createdResource.save();
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
    
    return resource;
  }

  async update(id: string, updateResourceDto: UpdateResourceDto, peopleId: Types.ObjectId): Promise<Resource> {
    const updatedResource = await this.resourceModel.findOneAndUpdate(
      { _id: id, peopleId },
      { $set: updateResourceDto },
      { new: true },
    ).exec();
    
    if (!updatedResource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }
    
    return updatedResource;
  }

  async remove(id: string, peopleId: Types.ObjectId): Promise<Resource> {
    const deletedResource = await this.resourceModel.findOneAndDelete({ 
      _id: id, 
      peopleId 
    }).exec();
    
    if (!deletedResource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }
    
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
}