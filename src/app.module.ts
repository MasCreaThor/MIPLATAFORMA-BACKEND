// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './modules/config/config.module';
import { DatabaseModule } from './modules/database/database.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { TagsModule } from './modules/tags/tags.module';
import { ProjectsModule } from './modules/projects/projects.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    CategoriesModule,
    ResourcesModule,
    KnowledgeModule,
    TagsModule,
    ProjectsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}