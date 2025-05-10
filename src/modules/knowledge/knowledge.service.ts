// src/modules/knowledge/knowledge.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { KnowledgeItem, KnowledgeItemDocument } from './schemas/knowledge-item.schema';
import { CreateKnowledgeItemDto } from './dto/create-knowledge-item.dto';
import { UpdateKnowledgeItemDto } from './dto/update-knowledge-item.dto';
import { FilterKnowledgeItemsDto } from './dto/filter-knowledge-items.dto';
import { TagsService } from '../tags/tags.service';
import { ActivityService } from '../activity/activity.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ActivityAction, EntityType } from '../activity/schemas/activity.schema';

@Injectable()
export class KnowledgeService {
  constructor(
    @InjectModel(KnowledgeItem.name) private knowledgeItemModel: Model<KnowledgeItemDocument>,
    private tagsService: TagsService,
    private activityService: ActivityService,
    private notificationsService: NotificationsService
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
    
    const savedItem = await createdKnowledgeItem.save();
    
    // Registrar la actividad
    await this.activityService.trackActivity(
      peopleId,
      ActivityAction.CREATE,
      EntityType.KNOWLEDGE_ITEM,
      new Types.ObjectId(savedItem._id as string),
      { type: savedItem.type },
      savedItem.title,
      savedItem.tags || []
    );
    
    // Generar notificación
    await this.notificationsService.createNotificationFromActivity(
      peopleId,
      ActivityAction.CREATE,
      EntityType.KNOWLEDGE_ITEM,
      new Types.ObjectId(savedItem._id as string),
      savedItem.title,
      { type: savedItem.type }
    );
    
    return savedItem;
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
    
    // Registrar la actividad de vista
    await this.activityService.trackActivity(
      peopleId,
      ActivityAction.VIEW,
      EntityType.KNOWLEDGE_ITEM,
      new Types.ObjectId(knowledgeItem._id as string),
      { type: knowledgeItem.type },
      knowledgeItem.title,
      knowledgeItem.tags || []
    );
    
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
    
    // Registrar la actividad
    await this.activityService.trackActivity(
      peopleId,
      ActivityAction.UPDATE,
      EntityType.KNOWLEDGE_ITEM,
      new Types.ObjectId(updatedKnowledgeItem._id as string),
      { type: updatedKnowledgeItem.type },
      updatedKnowledgeItem.title,
      updatedKnowledgeItem.tags || []
    );
    
    // Generar notificación
    await this.notificationsService.createNotificationFromActivity(
      peopleId,
      ActivityAction.UPDATE,
      EntityType.KNOWLEDGE_ITEM,
      new Types.ObjectId(updatedKnowledgeItem._id as string),
      updatedKnowledgeItem.title,
      { type: updatedKnowledgeItem.type }
    );
    
    return updatedKnowledgeItem;
  }

  async remove(id: string, peopleId: Types.ObjectId): Promise<KnowledgeItem> {
    // Primero encontrar el item para tener la información antes de eliminarlo
    const knowledgeItem = await this.findOne(id, peopleId);
    
    const deletedKnowledgeItem = await this.knowledgeItemModel.findOneAndDelete({ 
      _id: id, 
      peopleId 
    }).exec();
    
    if (!deletedKnowledgeItem) {
      throw new NotFoundException(`Knowledge item with ID ${id} not found`);
    }
    
    // Registrar la actividad
    await this.activityService.trackActivity(
      peopleId,
      ActivityAction.DELETE,
      EntityType.KNOWLEDGE_ITEM,
      new Types.ObjectId(id),
      { type: knowledgeItem.type },
      knowledgeItem.title,
      knowledgeItem.tags || []
    );
    
    // Generar notificación
    await this.notificationsService.createNotificationFromActivity(
      peopleId,
      ActivityAction.DELETE,
      EntityType.KNOWLEDGE_ITEM,
      new Types.ObjectId(id),
      knowledgeItem.title,
      { type: knowledgeItem.type }
    );
    
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
    
    // Registrar la actividad de relación
    await this.activityService.trackActivity(
      peopleId,
      ActivityAction.UPDATE,
      EntityType.KNOWLEDGE_ITEM,
      new Types.ObjectId(updatedKnowledgeItem._id as string),
      {
        action: 'addRelatedItem',
        relatedItemId: relatedItemId
      },
      updatedKnowledgeItem.title,
      updatedKnowledgeItem.tags || []
    );
    
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
    
    // Registrar la actividad de eliminación de relación
    await this.activityService.trackActivity(
      peopleId,
      ActivityAction.UPDATE,
      EntityType.KNOWLEDGE_ITEM,
      new Types.ObjectId(updatedKnowledgeItem._id as string),
      { 
        action: 'removeRelatedItem',
        relatedItemId: relatedItemId
      },
      updatedKnowledgeItem.title,
      updatedKnowledgeItem.tags || []
    );
    
    return updatedKnowledgeItem;
  }

  async processAndSaveTags(tags: string[], peopleId: Types.ObjectId): Promise<void> {
    if (!tags || tags.length === 0) {
      return;
    }
    
    await this.tagsService.bulkCreateOrUpdate(tags, peopleId);
  }
}