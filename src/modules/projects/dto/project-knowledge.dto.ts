// src/modules/projects/dto/project-knowledge.dto.ts
import { IsNotEmpty, IsMongoId, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class ProjectKnowledgeDto {
  @IsNotEmpty()
  @IsMongoId()
  knowledgeItemId: Types.ObjectId;

  @IsOptional()
  @IsString()
  notes?: string;
}