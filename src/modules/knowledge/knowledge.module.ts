// src/modules/knowledge/knowledge.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeItem, KnowledgeItemSchema } from './schemas/knowledge-item.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KnowledgeItem.name, schema: KnowledgeItemSchema },
    ]),
  ],
  controllers: [KnowledgeController],
  providers: [KnowledgeService],
  exports: [KnowledgeService],
})
export class KnowledgeModule {}