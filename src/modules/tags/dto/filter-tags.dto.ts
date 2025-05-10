// src/modules/tags/dto/filter-tags.dto.ts
import { IsOptional, IsString, IsNumber, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterTagsDto {
  @IsOptional()
  @IsString()
  search?: string;
  
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minUsageCount?: number;
  
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  popular?: boolean;
  
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}