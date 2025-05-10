// src/modules/projects/schemas/project-knowledge.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ProjectKnowledgeDocument = ProjectKnowledge & Document;

@Schema({ timestamps: true })
export class ProjectKnowledge {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Project', required: true })
  projectId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'KnowledgeItem', required: true })
  knowledgeItemId: MongooseSchema.Types.ObjectId;

  @Prop()
  notes: string;
}

export const ProjectKnowledgeSchema = SchemaFactory.createForClass(ProjectKnowledge);