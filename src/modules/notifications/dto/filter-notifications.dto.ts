// src/modules/notifications/dto/filter-notifications.dto.ts
import { 
    IsOptional, 
    IsBoolean, 
    IsEnum, 
    IsString, 
    IsInt, 
    Min, 
    Max,
    IsDateString,
    IsMongoId
  } from 'class-validator';
  import { Type, Transform } from 'class-transformer';
  import { NotificationType, NotificationPriority } from '../schemas/notification.schema';
  import { Types } from 'mongoose';
  
  export class FilterNotificationsDto {
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
      if (value === 'true') return true;
      if (value === 'false') return false;
      return value;
    })
    isRead?: boolean;
  
    @IsOptional()
    @IsEnum(NotificationType, { each: true })
    types?: NotificationType[];
  
    @IsOptional()
    @IsEnum(NotificationPriority, { each: true })
    priorities?: NotificationPriority[];
  
    @IsOptional()
    @IsString()
    relatedEntityType?: string;
  
    @IsOptional()
    @IsMongoId()
    relatedEntityId?: Types.ObjectId;
  
    @IsOptional()
    @IsString()
    search?: string;
  
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