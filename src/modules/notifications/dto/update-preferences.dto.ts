// src/modules/notifications/dto/update-preferences.dto.ts
import { 
    IsOptional, 
    IsBoolean, 
    IsObject, 
    IsDateString,
    ValidateIf
  } from 'class-validator';
  import { NotificationChannel, NotificationCategory } from '../schemas/notification-preference.schema';
  
  export class UpdatePreferencesDto {
    @IsOptional()
    @IsBoolean()
    enabled?: boolean;
  
    @IsOptional()
    @IsObject()
    channelPreferences?: Partial<Record<NotificationChannel, boolean>>;
  
    @IsOptional()
    @IsObject()
    categoryPreferences?: Partial<Record<NotificationCategory, boolean>>;
  
    @IsOptional()
    @IsBoolean()
    doNotDisturb?: boolean;
  
    @IsOptional()
    @IsDateString()
    @ValidateIf((o) => o.doNotDisturb === true)
    doNotDisturbStart?: string;
  
    @IsOptional()
    @IsDateString()
    @ValidateIf((o) => o.doNotDisturb === true)
    doNotDisturbEnd?: string;
  }