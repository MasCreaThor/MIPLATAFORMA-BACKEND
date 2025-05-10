// src/modules/tags/schemas/tag.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type TagDocument = Tag & Document;

@Schema({ timestamps: true })
export class Tag {
  @Prop({ required: true, unique: true, index: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ default: '#3B82F6' }) // Default to blue color
  color: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'People', required: true })
  peopleId: MongooseSchema.Types.ObjectId;

  @Prop({ default: 0 })
  usageCount: number;
}

export const TagSchema = SchemaFactory.createForClass(Tag);