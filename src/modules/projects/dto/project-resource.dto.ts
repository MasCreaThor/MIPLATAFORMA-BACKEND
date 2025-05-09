// src/modules/projects/dto/project-resource.dto.ts
import { IsNotEmpty, IsMongoId, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class ProjectResourceDto {
  @IsNotEmpty()
  @IsMongoId()
  resourceId: Types.ObjectId;

  @IsOptional()
  @IsString()
  notes?: string;
}