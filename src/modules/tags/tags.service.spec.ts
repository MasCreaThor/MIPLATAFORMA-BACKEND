// src/modules/tags/tags.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tag, TagDocument } from './schemas/tag.schema';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { FilterTagsDto } from './dto/filter-tags.dto';
import { ActivityService } from '../activity/activity.service';
import { ActivityAction, EntityType } from '../activity/schemas/activity.schema';

@Injectable()
export class TagsService {
  constructor(
    @InjectModel(Tag.name) private tagModel: Model<TagDocument>,
    private activityService: ActivityService
  ) {}

  async create(createTagDto: CreateTagDto, peopleId: Types.ObjectId): Promise<TagDocument> {
    // Check if tag with same name already exists for this user
    const existingTag = await this.tagModel.findOne({
      name: createTagDto.name,
      peopleId,
    }).exec();

    if (existingTag) {
      throw new ConflictException(`Tag with name "${createTagDto.name}" already exists`);
    }

    const createdTag = new this.tagModel({
      ...createTagDto,
      peopleId,
    });
    
    const savedTag = await createdTag.save();
    
    // Registrar la actividad
    await this.activityService.trackActivity(
      peopleId,
      ActivityAction.CREATE,
      EntityType.TAG,
      new Types.ObjectId(savedTag._id as string),
      {},
      savedTag.name
    );
    
    return savedTag;
  }

  async findAll(peopleId: Types.ObjectId, filterDto?: FilterTagsDto): Promise<TagDocument[]> {
    const query: any = { peopleId };
    
    if (filterDto) {
      if (filterDto.search) {
        query.$or = [
          { name: { $regex: filterDto.search, $options: 'i' } },
          { description: { $regex: filterDto.search, $options: 'i' } },
        ];
      }
      
      if (filterDto.minUsageCount) {
        query.usageCount = { $gte: filterDto.minUsageCount };
      }
    }
    
    let queryBuilder = this.tagModel.find(query);
    
    // Sort by popularity if requested
    if (filterDto?.popular) {
      queryBuilder = queryBuilder.sort({ usageCount: -1 });
    } else {
      queryBuilder = queryBuilder.sort({ name: 1 });
    }
    
    // Apply limit if specified
    if (filterDto?.limit) {
      queryBuilder = queryBuilder.limit(filterDto.limit);
    }
    
    return queryBuilder.exec();
  }

  async findOne(id: string, peopleId: Types.ObjectId): Promise<TagDocument> {
    const tag = await this.tagModel.findOne({ 
      _id: id, 
      peopleId 
    }).exec();
    
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
    
    // Registrar la actividad de vista
    await this.activityService.trackActivity(
      peopleId,
      ActivityAction.VIEW,
      EntityType.TAG,
      new Types.ObjectId(tag._id as string),
      { usageCount: tag.usageCount },
      tag.name
    );
    
    return tag;
  }

  async findByName(name: string, peopleId: Types.ObjectId): Promise<TagDocument> {
    const tag = await this.tagModel.findOne({
      name,
      peopleId,
    }).exec();
    
    if (!tag) {
      throw new NotFoundException(`Tag with name "${name}" not found`);
    }
    
    return tag;
  }

  async update(id: string, updateTagDto: UpdateTagDto, peopleId: Types.ObjectId): Promise<TagDocument> {
    // If updating the name, check for duplicates
    if (updateTagDto.name) {
      const existingTag = await this.tagModel.findOne({
        name: updateTagDto.name,
        peopleId,
        _id: { $ne: id },
      }).exec();
      
      if (existingTag) {
        throw new ConflictException(`Tag with name "${updateTagDto.name}" already exists`);
      }
    }
    
    const updatedTag = await this.tagModel.findOneAndUpdate(
      { _id: id, peopleId },
      { $set: updateTagDto },
      { new: true },
    ).exec();
    
    if (!updatedTag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
    
    // Registrar la actividad
    await this.activityService.trackActivity(
      peopleId,
      ActivityAction.UPDATE,
      EntityType.TAG,
      new Types.ObjectId(updatedTag._id as string),
      { usageCount: updatedTag.usageCount },
      updatedTag.name
    );
    
    return updatedTag;
  }

  async remove(id: string, peopleId: Types.ObjectId): Promise<TagDocument> {
    // Primero encontrar el tag para tener información antes de eliminarlo
    const tag = await this.findOne(id, peopleId);
    
    const deletedTag = await this.tagModel.findOneAndDelete({ 
      _id: id, 
      peopleId 
    }).exec();
    
    if (!deletedTag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
    
    // Registrar la actividad
    await this.activityService.trackActivity(
      peopleId,
      ActivityAction.DELETE,
      EntityType.TAG,
      new Types.ObjectId(id),
      { usageCount: tag.usageCount },
      tag.name
    );
    
    return deletedTag;
  }

  async incrementUsageCount(id: string, peopleId: Types.ObjectId): Promise<TagDocument> {
    const tag = await this.tagModel.findOneAndUpdate(
      { _id: id, peopleId },
      { $inc: { usageCount: 1 } },
      { new: true },
    ).exec();
    
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
    
    return tag;
  }

  async incrementUsageCountByName(name: string, peopleId: Types.ObjectId): Promise<TagDocument | null> {
    try {
      // Try to find the tag first
      const existingTag = await this.tagModel.findOne({
        name,
        peopleId,
      }).exec();
      
      // If tag exists, increment usage count
      if (existingTag) {
        const updatedTag = await this.tagModel.findOneAndUpdate(
          { _id: existingTag._id },
          { $inc: { usageCount: 1 } },
          { new: true },
        ).exec();
        
        if (!updatedTag) {
          throw new NotFoundException(`Tag with ID ${existingTag._id} not found`);
        }
        
        return updatedTag;
      } 
      // If tag doesn't exist, create it
      else {
        const newTag = new this.tagModel({
          name,
          peopleId,
          usageCount: 1, // Initialize with count 1 since it's being used
        });
        
        const savedTag = await newTag.save();
        
        // Registrar la actividad de creación automática
        await this.activityService.trackActivity(
          peopleId,
          ActivityAction.CREATE,
          EntityType.TAG,
          new Types.ObjectId(savedTag._id as string),
          { autoCreated: true, usageCount: 1 },
          savedTag.name
        );
        
        return savedTag;
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Para cualquier otro tipo de error, lanza una excepción genérica
      throw new Error(`Error processing tag "${name}": ${error.message}`);
    }
  }

  async getPopularTags(peopleId: Types.ObjectId, limit = 10): Promise<TagDocument[]> {
    return this.tagModel.find({ peopleId })
      .sort({ usageCount: -1 })
      .limit(limit)
      .exec();
  }

  async bulkCreateOrUpdate(tagNames: string[], peopleId: Types.ObjectId): Promise<TagDocument[]> {
    if (!tagNames || tagNames.length === 0) {
      return [];
    }
    
    const tags: TagDocument[] = [];
    
    for (const name of tagNames) {
      try {
        // Try to increment usage count for existing tag
        const existingTag = await this.incrementUsageCountByName(name, peopleId);
        if (existingTag) {
          tags.push(existingTag);
        }
      } catch (error) {
        // If there's an error, just continue with the next tag
        console.error(`Error processing tag "${name}":`, error);
      }
    }
    
    return tags;
  }
}