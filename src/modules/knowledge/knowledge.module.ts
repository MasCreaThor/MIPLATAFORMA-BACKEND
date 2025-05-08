// src/modules/knowledge/knowledge.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeItem, KnowledgeItemSchema } from './schemas/knowledge-item.schema';
import { TagsModule } from '../tags/tags.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KnowledgeItem.name, schema: KnowledgeItemSchema },
    ]),
    TagsModule,
  ],
  controllers: [KnowledgeController],
  providers: [KnowledgeService],
  exports: [KnowledgeService],
})
export class KnowledgeModule {}