// src/modules/activity/dto/activity-response.dto.ts
import { IsInt, IsBoolean, IsNotEmpty, IsArray } from 'class-validator';
import { ActivityDocument } from '../schemas/activity.schema';

export class PaginatedActivityResponseDto {
  @IsArray()
  @IsNotEmpty()
  items: ActivityDocument[];

  @IsInt()
  total: number;

  @IsInt()
  page: number;

  @IsInt()
  limit: number;

  @IsInt()
  pages: number;

  @IsBoolean()
  hasNextPage: boolean;

  @IsBoolean()
  hasPrevPage: boolean;
}