// src/modules/projects/projects.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project, ProjectSchema } from './schemas/project.schema';
import { ProjectResource, ProjectResourceSchema } from './schemas/project-resource.schema';
import { ProjectKnowledge, ProjectKnowledgeSchema } from './schemas/project-knowledge.schema';
import { TagsModule } from '../tags/tags.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: ProjectResource.name, schema: ProjectResourceSchema },
      { name: ProjectKnowledge.name, schema: ProjectKnowledgeSchema },
    ]),
    TagsModule,
    ActivityModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}