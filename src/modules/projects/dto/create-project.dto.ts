// src/modules/projects/dto/create-project.dto.ts
import { 
    IsNotEmpty, 
    IsString, 
    IsEnum, 
    IsOptional, 
    IsArray,
    IsMongoId,
    IsUrl,
    IsDateString
  } from 'class-validator';
  import { ProjectStatus } from '../schemas/project.schema';
  import { Types } from 'mongoose';
  
  export class CreateProjectDto {
    @IsNotEmpty()
    @IsString()
    name: string;
  
    @IsOptional()
    @IsString()
    description?: string;
  
    @IsOptional()
    @IsEnum(ProjectStatus)
    status?: ProjectStatus;
  
    @IsOptional()
    @IsDateString()
    startDate?: string;
  
    @IsOptional()
    @IsDateString()
    endDate?: string;
  
    @IsOptional()
    @IsUrl()
    repositoryUrl?: string;
  
    @IsOptional()
    @IsUrl()
    demoUrl?: string;
  
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
  
    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    members?: Types.ObjectId[];
  }