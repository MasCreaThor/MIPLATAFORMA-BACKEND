// src/modules/notifications/dto/create-notification.dto.ts
import { 
    IsNotEmpty, 
    IsString, 
    IsEnum, 
    IsOptional, 
    IsMongoId, 
    IsObject,
    IsDateString,
    ValidateIf
  } from 'class-validator';
  import { NotificationType, NotificationPriority } from '../schemas/notification.schema';
  import { Types } from 'mongoose';
  
  export class CreateNotificationDto {
    @IsNotEmpty()
    @IsString()
    title: string;
  
    @IsNotEmpty()
    @IsString()
    message: string;
  
    @IsEnum(NotificationType)
    @IsOptional()
    type?: NotificationType;
  
    @IsEnum(NotificationPriority)
    @IsOptional()
    priority?: NotificationPriority;
  
    @IsString()
    @IsOptional()
    relatedEntityType?: string;
  
    @IsMongoId()
    @IsOptional()
    @ValidateIf((o) => o.relatedEntityType !== undefined)
    relatedEntityId?: Types.ObjectId;
  
    @IsObject()
    @IsOptional()
    additionalData?: Record<string, any>;
  
    @IsDateString()
    @IsOptional()
    expiresAt?: string;
  }