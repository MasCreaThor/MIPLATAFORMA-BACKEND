// src/modules/knowledge/dto/create-knowledge-item.dto.ts
import { 
    IsNotEmpty, 
    IsString, 
    IsEnum, 
    IsOptional, 
    IsMongoId, 
    IsBoolean, 
    IsArray,
    ValidateNested,
    IsObject,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  import { KnowledgeItemType } from '../schemas/knowledge-item.schema';
  import { Types } from 'mongoose';
  
  export class SolutionDetailsDto {
    @IsOptional()
    @IsString()
    problem?: string;
  
    @IsOptional()
    @IsString()
    solution?: string;
  
    @IsOptional()
    @IsString()
    context?: string;
  }
  
  export class CreateKnowledgeItemDto {
    @IsNotEmpty()
    @IsString()
    title: string;
  
    @IsNotEmpty()
    @IsEnum(KnowledgeItemType)
    type: KnowledgeItemType;
  
    @IsOptional()
    @IsMongoId()
    categoryId?: Types.ObjectId;
  
    @IsOptional()
    @IsString()
    content?: string;
  
    @IsOptional()
    @IsString()
    codeContent?: string;
  
    @IsOptional()
    @IsString()
    codeLanguage?: string;
  
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => SolutionDetailsDto)
    solutionDetails?: SolutionDetailsDto;
  
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
  
    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    relatedItems?: Types.ObjectId[];
  
    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    references?: Types.ObjectId[];
  
    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;
  }