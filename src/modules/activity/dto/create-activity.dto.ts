// src/modules/activity/dto/create-activity.dto.ts
import { 
    IsNotEmpty, 
    IsEnum, 
    IsMongoId, 
    IsObject, 
    IsOptional, 
    IsString,
    IsArray 
  } from 'class-validator';
  import { ActivityAction, EntityType } from '../schemas/activity.schema';
  import { Types } from 'mongoose';
  
  export class CreateActivityDto {
    @IsEnum(ActivityAction)
    @IsNotEmpty()
    action: ActivityAction;
  
    @IsEnum(EntityType)
    @IsNotEmpty()
    entityType: EntityType;
  
    @IsMongoId()
    @IsNotEmpty()
    entityId: Types.ObjectId;
  
    @IsObject()
    @IsOptional()
    details?: Record<string, any>;
  
    @IsString()
    @IsOptional()
    entityTitle?: string;
  
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];
  }