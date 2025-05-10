// src/modules/dashboard/dashboard.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardConfig, DashboardConfigSchema } from './schemas/dashboard-config.schema';

// Import schemas from other modules
import { Resource, ResourceSchema } from '../resources/schemas/resource.schema';
import { KnowledgeItem, KnowledgeItemSchema } from '../knowledge/schemas/knowledge-item.schema';
import { Project, ProjectSchema } from '../projects/schemas/project.schema';
import { Tag, TagSchema } from '../tags/schemas/tag.schema';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DashboardConfig.name, schema: DashboardConfigSchema },
      { name: Resource.name, schema: ResourceSchema },
      { name: KnowledgeItem.name, schema: KnowledgeItemSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Tag.name, schema: TagSchema },
    ]),
    ActivityModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}