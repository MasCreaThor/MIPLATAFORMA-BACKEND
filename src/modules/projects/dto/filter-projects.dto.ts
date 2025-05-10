// src/modules/projects/dto/filter-projects.dto.ts
import { IsOptional, IsString, IsEnum, IsArray, IsMongoId, IsDateString } from 'class-validator';
import { ProjectStatus } from '../schemas/project.schema';
import { Types } from 'mongoose';

export class FilterProjectsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ProjectStatus, { each: true })
  status?: ProjectStatus[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsMongoId()
  memberId?: Types.ObjectId;

  @IsOptional()
  @IsDateString()
  startDateFrom?: string;

  @IsOptional()
  @IsDateString()
  startDateTo?: string;

  @IsOptional()
  @IsDateString()
  endDateFrom?: string;

  @IsOptional()
  @IsDateString()
  endDateTo?: string;
}