// src/modules/categories/schemas/category.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category', default: null })
  parentId: MongooseSchema.Types.ObjectId | null;

  @Prop()
  color: string;

  @Prop()
  icon: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'People', required: true })
  peopleId: MongooseSchema.Types.ObjectId;
  
  @Prop({ default: false })
  isPublic: boolean;
  
  @Prop({ default: false })
  isSystem: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);