// src/modules/activity/schemas/activity.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ActivityDocument = Activity & Document;

export enum ActivityAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  SHARE = 'share',
  IMPORT = 'import',
  EXPORT = 'export',
}

export enum EntityType {
  RESOURCE = 'resource',
  KNOWLEDGE_ITEM = 'knowledgeItem',
  PROJECT = 'project',
  CATEGORY = 'category',
  TAG = 'tag',
  DASHBOARD = 'dashboard',
}

@Schema({ timestamps: true })
export class Activity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'People', required: true, index: true })
  peopleId: MongooseSchema.Types.ObjectId;

  @Prop({ 
    type: String, 
    enum: Object.values(ActivityAction), 
    required: true,
    index: true 
  })
  action: ActivityAction;

  @Prop({ 
    type: String, 
    enum: Object.values(EntityType), 
    required: true,
    index: true 
  })
  entityType: EntityType;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, index: true })
  entityId: MongooseSchema.Types.ObjectId;

  @Prop({ type: Object, default: {} })
  details: Record<string, any>;

  // Automatically managed by timestamps option
  // @Prop({ type: Date, default: Date.now, index: true })
  // createdAt: Date;
  
  // Fields for improved searching and filtering
  @Prop({ type: String, required: false })
  entityTitle: string;

  @Prop({ type: [String], default: [], index: true })
  tags: string[];
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);

// Create compound index for common queries
ActivitySchema.index({ peopleId: 1, createdAt: -1 });
ActivitySchema.index({ entityType: 1, entityId: 1 });