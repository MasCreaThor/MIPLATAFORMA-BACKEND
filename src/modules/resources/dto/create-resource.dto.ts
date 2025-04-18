// src/modules/resources/dto/create-resource.dto.ts
import { IsNotEmpty, IsString, IsEnum, IsOptional, IsMongoId, IsBoolean, IsNumber, IsArray } from 'class-validator';
import { ResourceType } from '../schemas/resource.schema';
import { Types } from 'mongoose';

export class CreateResourceDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsEnum(ResourceType)
  type: ResourceType;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  filePath?: string;

  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @IsOptional()
  @IsString()
  fileType?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsMongoId()
  categoryId?: Types.ObjectId;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
