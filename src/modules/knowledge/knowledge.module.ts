// src/modules/knowledge/knowledge.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeItem, KnowledgeItemSchema } from './schemas/knowledge-item.schema';
import { TagsModule } from '../tags/tags.module';
import { ActivityModule } from '../activity/activity.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KnowledgeItem.name, schema: KnowledgeItemSchema },
    ]),
    TagsModule,
    ActivityModule,
    NotificationsModule,
  ],
  controllers: [KnowledgeController],
  providers: [KnowledgeService],
  exports: [KnowledgeService],
})
export class KnowledgeModule {}