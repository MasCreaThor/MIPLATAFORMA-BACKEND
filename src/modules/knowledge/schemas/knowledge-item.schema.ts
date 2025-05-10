// src/modules/knowledge/schemas/knowledge-item.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type KnowledgeItemDocument = KnowledgeItem & Document;

export enum KnowledgeItemType {
  WIKI = 'wiki',
  NOTE = 'note',
  SNIPPET = 'snippet',
  COMMAND = 'command',
  SOLUTION = 'solution',
}

@Schema({ timestamps: true })
export class KnowledgeItem {
  @Prop({ required: true })
  title: string;

  @Prop({
    type: String,
    enum: Object.values(KnowledgeItemType),
    required: true,
  })
  type: KnowledgeItemType;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category' })
  categoryId: MongooseSchema.Types.ObjectId;

  @Prop()
  content: string;

  @Prop()
  codeContent: string;

  @Prop()
  codeLanguage: string;

  @Prop({
    type: {
      problem: String,
      solution: String,
      context: String,
    },
    _id: false,
  })
  solutionDetails: {
    problem: string;
    solution: string;
    context: string;
  };

  @Prop([String])
  tags: string[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'KnowledgeItem' }] })
  relatedItems: MongooseSchema.Types.ObjectId[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Resource' }] })
  references: MongooseSchema.Types.ObjectId[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'People', required: true })
  peopleId: MongooseSchema.Types.ObjectId;

  @Prop({ default: false })
  isPublic: boolean;

  @Prop({ default: 0 })
  usageCount: number;
}

export const KnowledgeItemSchema = SchemaFactory.createForClass(KnowledgeItem);