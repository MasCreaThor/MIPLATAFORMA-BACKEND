// src/modules/activity/activity.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, PipelineStage } from 'mongoose';
import { Activity, ActivityDocument, ActivityAction, EntityType } from './schemas/activity.schema';
import { CreateActivityDto } from './dto/create-activity.dto';
import { FilterActivitiesDto } from './dto/filter-activities.dto';
import { PaginatedActivityResponseDto } from './dto/activity-response.dto';

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
  ) {}

  // Cambio del tipo de retorno para permitir null
  async create(peopleId: Types.ObjectId, createActivityDto: CreateActivityDto): Promise<ActivityDocument | null> {
    try {
      const createdActivity = new this.activityModel({
        peopleId,
        ...createActivityDto,
      });
      
      return await createdActivity.save();
    } catch (error) {
      this.logger.error(`Error creating activity: ${error.message}`, error.stack);
      // Don't throw the error, just log it to prevent activity tracking from breaking main functionality
      return null;
    }
  }

  async findAll(
    peopleId: Types.ObjectId, 
    filterDto: FilterActivitiesDto
  ): Promise<PaginatedActivityResponseDto> {
    // Build query
    const query: any = { peopleId };
    
    // Apply filters
    if (filterDto.actions && filterDto.actions.length > 0) {
      query.action = { $in: filterDto.actions };
    }
    
    if (filterDto.entityTypes && filterDto.entityTypes.length > 0) {
      query.entityType = { $in: filterDto.entityTypes };
    }
    
    if (filterDto.entityId) {
      query.entityId = filterDto.entityId;
    }
    
    if (filterDto.tags && filterDto.tags.length > 0) {
      query.tags = { $in: filterDto.tags };
    }
    
    if (filterDto.search) {
      query.$or = [
        { entityTitle: { $regex: filterDto.search, $options: 'i' } },
      ];
    }
    
    if (filterDto.startDate || filterDto.endDate) {
      query.createdAt = {};
      if (filterDto.startDate) {
        query.createdAt.$gte = new Date(filterDto.startDate);
      }
      if (filterDto.endDate) {
        query.createdAt.$lte = new Date(filterDto.endDate);
      }
    }
    
    // Calculate pagination
    const limit = filterDto.limit || 20;
    const skip = filterDto.skip || 0;
    const page = Math.floor(skip / limit) + 1;
    
    // Get total count
    const total = await this.activityModel.countDocuments(query).exec();
    
    // Sort options
    const sortField = filterDto.sortBy || 'createdAt';
    const sortOrder = filterDto.sortOrder === 'asc' ? 1 : -1;
    const sort: any = {};
    sort[sortField] = sortOrder;
    
    // Get items
    const items = await this.activityModel.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
    
    // Calculate pagination details
    const pages = Math.ceil(total / limit);
    
    return {
      items,
      total,
      page,
      limit,
      pages,
      hasNextPage: page < pages,
      hasPrevPage: page > 1,
    };
  }

  async getRecentActivity(peopleId: Types.ObjectId, limit = 10): Promise<ActivityDocument[]> {
    return this.activityModel.find({ peopleId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getActivityCounts(peopleId: Types.ObjectId): Promise<Record<string, number>> {
    const pipeline: PipelineStage[] = [
      { $match: { peopleId: new Types.ObjectId(peopleId.toString()) } },
      { $group: { _id: '$entityType', count: { $sum: 1 } } },
    ];
    
    const result = await this.activityModel.aggregate(pipeline).exec();
    
    // Convert array to object
    return result.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>);
  }

  async getActivityCountsByAction(peopleId: Types.ObjectId): Promise<Record<string, number>> {
    const pipeline: PipelineStage[] = [
      { $match: { peopleId: new Types.ObjectId(peopleId.toString()) } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
    ];
    
    const result = await this.activityModel.aggregate(pipeline).exec();
    
    // Convert array to object
    return result.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>);
  }

  async getActivityTimeline(
    peopleId: Types.ObjectId, 
    days = 30
  ): Promise<Array<{ date: Date; count: number }>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    
    // Corregir la sintaxis de la agregación
    const pipeline: PipelineStage[] = [
      {
        $match: { 
          peopleId: new Types.ObjectId(peopleId.toString()),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      // Corrección del $sort para usar notación compatible con TypeScript
      { 
        $sort: { 
          "_id.year": 1, 
          "_id.month": 1, 
          "_id.day": 1 
        } as any // Usar 'as any' para evitar errores de tipo
      }
    ];
    
    const result = await this.activityModel.aggregate(pipeline).exec();
    
    // Convert to array with dates
    return result.map(item => ({
      date: new Date(item._id.year, item._id.month - 1, item._id.day),
      count: item.count
    }));
  }

  // Helper method to track activity easily from other services
  // Actualizar tipo de retorno aquí también
  async trackActivity(
    peopleId: Types.ObjectId, 
    action: ActivityAction,
    entityType: EntityType,
    entityId: Types.ObjectId,
    details: Record<string, any> = {},
    entityTitle?: string,
    tags: string[] = []
  ): Promise<ActivityDocument | null> {
    return this.create(peopleId, {
      action,
      entityType,
      entityId,
      details,
      entityTitle,
      tags
    });
  }
}