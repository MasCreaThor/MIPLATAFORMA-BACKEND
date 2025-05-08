// src/modules/resources/dto/filter-resources.dto.ts
import { IsOptional, IsString, IsEnum, IsMongoId, IsBoolean, IsArray } from 'class-validator';
import { ResourceType } from '../schemas/resource.schema';
import { Types } from 'mongoose';

export class FilterResourcesDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ResourceType, { each: true })
  types?: ResourceType[];

  @IsOptional()
  @IsMongoId()
  categoryId?: Types.ObjectId;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}