// src/modules/knowledge/knowledge.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { KnowledgeItem, KnowledgeItemDocument } from './schemas/knowledge-item.schema';
import { CreateKnowledgeItemDto } from './dto/create-knowledge-item.dto';
import { UpdateKnowledgeItemDto } from './dto/update-knowledge-item.dto';
import { FilterKnowledgeItemsDto } from './dto/filter-knowledge-items.dto';
import { TagsService } from '../tags/tags.service';

@Injectable()
export class KnowledgeService {
  constructor(
    @InjectModel(KnowledgeItem.name) private knowledgeItemModel: Model<KnowledgeItemDocument>,
    private tagsService: TagsService
  ) {}

  async create(createKnowledgeItemDto: CreateKnowledgeItemDto, peopleId: Types.ObjectId): Promise<KnowledgeItem> {
    const createdKnowledgeItem = new this.knowledgeItemModel({
      ...createKnowledgeItemDto,
      peopleId,
    });
    
    // Procesar las etiquetas si existen
    if (createKnowledgeItemDto.tags && createKnowledgeItemDto.tags.length > 0) {
      await this.processAndSaveTags(createKnowledgeItemDto.tags, peopleId);
    }
    
    return createdKnowledgeItem.save();
  }

  async findAll(peopleId: Types.ObjectId, filterDto?: FilterKnowledgeItemsDto): Promise<KnowledgeItem[]> {
    const query: any = { peopleId };

    if (filterDto) {
      // Add filters if provided
      if (filterDto.search) {
        query.$or = [
          { title: { $regex: filterDto.search, $options: 'i' } },
          { content: { $regex: filterDto.search, $options: 'i' } },
          { codeContent: { $regex: filterDto.search, $options: 'i' } },
          { 'solutionDetails.problem': { $regex: filterDto.search, $options: 'i' } },
          { 'solutionDetails.solution': { $regex: filterDto.search, $options: 'i' } },
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

      if (filterDto.relatedTo) {
        query.relatedItems = filterDto.relatedTo;
      }

      if (filterDto.referencesResource) {
        query.references = filterDto.referencesResource;
      }
    }

    return this.knowledgeItemModel.find(query).exec();
  }

  async findOne(id: string, peopleId: Types.ObjectId): Promise<KnowledgeItem> {
    const knowledgeItem = await this.knowledgeItemModel.findOne({ 
      _id: id, 
      peopleId 
    }).exec();
    
    if (!knowledgeItem) {
      throw new NotFoundException(`Knowledge item with ID ${id} not found`);
    }
    
    return knowledgeItem;
  }

  async update(id: string, updateKnowledgeItemDto: UpdateKnowledgeItemDto, peopleId: Types.ObjectId): Promise<KnowledgeItem> {
    // Procesar las etiquetas si existen
    if (updateKnowledgeItemDto.tags && updateKnowledgeItemDto.tags.length > 0) {
      await this.processAndSaveTags(updateKnowledgeItemDto.tags, peopleId);
    }
    
    const updatedKnowledgeItem = await this.knowledgeItemModel.findOneAndUpdate(
      { _id: id, peopleId },
      { $set: updateKnowledgeItemDto },
      { new: true },
    ).exec();
    
    if (!updatedKnowledgeItem) {
      throw new NotFoundException(`Knowledge item with ID ${id} not found`);
    }
    
    return updatedKnowledgeItem;
  }

  async remove(id: string, peopleId: Types.ObjectId): Promise<KnowledgeItem> {
    const deletedKnowledgeItem = await this.knowledgeItemModel.findOneAndDelete({ 
      _id: id, 
      peopleId 
    }).exec();
    
    if (!deletedKnowledgeItem) {
      throw new NotFoundException(`Knowledge item with ID ${id} not found`);
    }
    
    return deletedKnowledgeItem;
  }

  async incrementUsageCount(id: string, peopleId: Types.ObjectId): Promise<KnowledgeItem> {
    const knowledgeItem = await this.knowledgeItemModel.findOneAndUpdate(
      { _id: id, peopleId },
      { $inc: { usageCount: 1 } },
      { new: true },
    ).exec();
    
    if (!knowledgeItem) {
      throw new NotFoundException(`Knowledge item with ID ${id} not found`);
    }
    
    return knowledgeItem;
  }

  async findByCategory(categoryId: string, peopleId: Types.ObjectId): Promise<KnowledgeItem[]> {
    return this.knowledgeItemModel.find({ 
      categoryId: new Types.ObjectId(categoryId), 
      peopleId 
    }).exec();
  }

  async findByTags(tags: string[], peopleId: Types.ObjectId): Promise<KnowledgeItem[]> {
    return this.knowledgeItemModel.find({ 
      tags: { $in: tags }, 
      peopleId 
    }).exec();
  }

  async findRelatedItems(id: string, peopleId: Types.ObjectId): Promise<KnowledgeItem[]> {
    const knowledgeItem = await this.findOne(id, peopleId);
    
    if (!knowledgeItem.relatedItems || knowledgeItem.relatedItems.length === 0) {
      return [];
    }
    
    return this.knowledgeItemModel.find({
      _id: { $in: knowledgeItem.relatedItems },
      peopleId,
    }).exec();
  }

  async addRelatedItem(id: string, relatedItemId: string, peopleId: Types.ObjectId): Promise<KnowledgeItem> {
    // Verify both items exist
    await this.findOne(id, peopleId);
    await this.findOne(relatedItemId, peopleId);
    
    const updatedKnowledgeItem = await this.knowledgeItemModel.findOneAndUpdate(
      { _id: id, peopleId },
      { $addToSet: { relatedItems: new Types.ObjectId(relatedItemId) } },
      { new: true },
    ).exec();
    
    if (!updatedKnowledgeItem) {
      throw new NotFoundException(`Knowledge item with ID ${id} not found`);
    }
    
    return updatedKnowledgeItem;
  }

  async removeRelatedItem(id: string, relatedItemId: string, peopleId: Types.ObjectId): Promise<KnowledgeItem> {
    const updatedKnowledgeItem = await this.knowledgeItemModel.findOneAndUpdate(
      { _id: id, peopleId },
      { $pull: { relatedItems: new Types.ObjectId(relatedItemId) } },
      { new: true },
    ).exec();
    
    if (!updatedKnowledgeItem) {
      throw new NotFoundException(`Knowledge item with ID ${id} not found`);
    }
    
    return updatedKnowledgeItem;
  }

  async processAndSaveTags(tags: string[], peopleId: Types.ObjectId): Promise<void> {
    if (!tags || tags.length === 0) {
      return;
    }
    
    await this.tagsService.bulkCreateOrUpdate(tags, peopleId);
  }
}