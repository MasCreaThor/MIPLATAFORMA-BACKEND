// src/modules/resources/schemas/resource.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ResourceDocument = Resource & Document;

export enum ResourceType {
  DOCUMENTATION = 'documentation',
  TUTORIAL = 'tutorial',
  LINK = 'link',
  FILE = 'file',
  VIDEO = 'video',
}

@Schema({ timestamps: true })
export class Resource {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({
    type: String,
    enum: Object.values(ResourceType),
    required: true,
  })
  type: ResourceType;

  @Prop()
  content: string;

  @Prop()
  url: string;

  @Prop()
  filePath: string;

  @Prop()
  fileSize: number;

  @Prop()
  fileType: string;

  @Prop()
  thumbnailUrl: string;

  @Prop([String])
  tags: string[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category' })
  categoryId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'People', required: true })
  peopleId: MongooseSchema.Types.ObjectId;

  @Prop({ default: false })
  isPublic: boolean;

  @Prop({ default: 0 })
  usageCount: number;
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);