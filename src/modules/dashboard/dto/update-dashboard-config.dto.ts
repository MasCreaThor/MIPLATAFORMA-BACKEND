// src/modules/dashboard/dto/update-dashboard-config.dto.ts
import { 
    IsNotEmpty, 
    IsString, 
    IsEnum, 
    IsObject, 
    IsNumber, 
    Min, 
    ValidateNested, 
    IsArray, 
    IsOptional 
  } from 'class-validator';
  import { Type } from 'class-transformer';
  import { WidgetType } from '../schemas/dashboard-config.schema';
  
  export class WidgetPositionDto {
    @IsNumber()
    @Min(0)
    x: number;
  
    @IsNumber()
    @Min(0)
    y: number;
  
    @IsNumber()
    @Min(1)
    width: number;
  
    @IsNumber()
    @Min(1)
    height: number;
  }
  
  export class WidgetDto {
    @IsString()
    @IsNotEmpty()
    id: string;
  
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
  
  export class UpdateDashboardConfigDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => WidgetDto)
    @IsOptional()
    widgets?: WidgetDto[];
  
    @IsObject()
    @IsOptional()
    layout?: Record<string, any>;
  
    @IsString()
    @IsOptional()
    theme?: string;
  }