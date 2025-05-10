// src/modules/knowledge/dto/filter-knowledge-items.dto.ts
import { IsOptional, IsString, IsEnum, IsMongoId, IsBoolean, IsArray } from 'class-validator';
import { KnowledgeItemType } from '../schemas/knowledge-item.schema';
import { Types } from 'mongoose';

export class FilterKnowledgeItemsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(KnowledgeItemType, { each: true })
  types?: KnowledgeItemType[];

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

  @IsOptional()
  @IsMongoId()
  relatedTo?: Types.ObjectId;

  @IsOptional()
  @IsMongoId()
  referencesResource?: Types.ObjectId;
}