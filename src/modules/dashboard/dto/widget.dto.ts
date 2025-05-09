// src/modules/dashboard/dto/widget.dto.ts
import { 
    IsNotEmpty, 
    IsString, 
    IsEnum, 
    IsObject, 
    ValidateNested, 
    IsOptional 
  } from 'class-validator';
  import { Type } from 'class-transformer';
  import { WidgetType } from '../schemas/dashboard-config.schema';
  import { WidgetPositionDto } from './update-dashboard-config.dto';
  
  export class AddWidgetDto {
    @IsEnum(WidgetType)
    type: WidgetType;
  
    @IsString()
    @IsNotEmpty()
    title: string;
  
    @IsObject()
    @IsOptional()
    configuration?: Record<string, any>;
  
    @ValidateNested()
    @Type(() => WidgetPositionDto)
    position: WidgetPositionDto;
  }
  
  export class UpdateWidgetDto {
    @IsString()
    @IsOptional()
    title?: string;
  
    @IsObject()
    @IsOptional()
    configuration?: Record<string, any>;
  
    @ValidateNested()
    @Type(() => WidgetPositionDto)
    @IsOptional()
    position?: WidgetPositionDto;
  }