// src/modules/activity/dto/filter-activities.dto.ts
import { 
    IsEnum, 
    IsOptional, 
    IsArray, 
    IsMongoId, 
    IsString, 
    IsDateString,
    IsInt,
    Min,
    Max 
  } from 'class-validator';
  import { Type } from 'class-transformer';
  import { ActivityAction, EntityType } from '../schemas/activity.schema';
  import { Types } from 'mongoose';
  
  export class FilterActivitiesDto {
    @IsOptional()
    @IsArray()
    @IsEnum(ActivityAction, { each: true })
    actions?: ActivityAction[];
  
    @IsOptional()
    @IsArray()
    @IsEnum(EntityType, { each: true })
    entityTypes?: EntityType[];
  
    @IsOptional()
    @IsMongoId()
    entityId?: Types.ObjectId;
  
    @IsOptional()
    @IsString()
    search?: string;
  
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
  
    @IsOptional()
    @IsDateString()
    startDate?: string;
  
    @IsOptional()
    @IsDateString()
    endDate?: string;
  
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    limit?: number = 20;
  
    @IsOptional()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    skip?: number = 0;
  
    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';
  
    @IsOptional()
    @IsString()
    sortOrder?: 'asc' | 'desc' = 'desc';
  }