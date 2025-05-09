// src/modules/dashboard/dto/dashboard-stats.dto.ts
import { 
  IsNotEmpty, 
  IsNumber, 
  IsObject, 
  IsArray, 
  IsDate, 
  IsString 
} from 'class-validator';

export class ResourceStats {
  @IsNumber()
  total: number;

  @IsNumber()
  documentation: number;

  @IsNumber()
  tutorial: number;

  @IsNumber()
  link: number;

  @IsNumber()
  file: number;

  @IsNumber()
  video: number;
}

export class KnowledgeStats {
  @IsNumber()
  total: number;

  @IsNumber()
  wiki: number;

  @IsNumber()
  note: number;

  @IsNumber()
  snippet: number;

  @IsNumber()
  command: number;

  @IsNumber()
  solution: number;
}

export class ProjectStats {
  @IsNumber()
  total: number;

  @IsNumber()
  active: number;

  @IsNumber()
  completed: number;

  @IsNumber()
  archived: number;
}

export class TimeSeriesData {
  @IsDate()
  date: Date;

  @IsNumber()
  count: number;
}

export class RecentActivityData {
  @IsString()
  type: string;

  @IsString()
  title: string;

  @IsString()
  id: string;

  @IsDate()
  date: Date;
}

export class DashboardStatsDto {
  @IsObject()
  resources: ResourceStats;

  @IsObject()
  knowledge: KnowledgeStats;

  @IsObject()
  projects: ProjectStats;

  @IsNumber()
  totalTags: number;

  @IsArray()
  popularTags: Array<{ name: string; count: number }>;

  @IsArray()
  activityTimeline: TimeSeriesData[];

  @IsArray()
  recentActivity: RecentActivityData[];
}