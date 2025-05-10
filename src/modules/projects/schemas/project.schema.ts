// src/modules/projects/schemas/project.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ProjectDocument = Project & Document;

export enum ProjectStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({
    type: String,
    enum: Object.values(ProjectStatus),
    default: ProjectStatus.ACTIVE,
  })
  status: ProjectStatus;

  @Prop({ type: Date })
  startDate: Date;

  @Prop({ type: Date })
  endDate: Date;

  @Prop()
  repositoryUrl: string;

  @Prop()
  demoUrl: string;

  @Prop([String])
  tags: string[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'People', required: true })
  peopleId: MongooseSchema.Types.ObjectId;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'People' }] })
  members: MongooseSchema.Types.ObjectId[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);