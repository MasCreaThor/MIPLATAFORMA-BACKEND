// src/modules/projects/schemas/project-resource.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ProjectResourceDocument = ProjectResource & Document;

@Schema({ timestamps: true })
export class ProjectResource {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Project', required: true })
  projectId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Resource', required: true })
  resourceId: MongooseSchema.Types.ObjectId;

  @Prop()
  notes: string;
}

export const ProjectResourceSchema = SchemaFactory.createForClass(ProjectResource);