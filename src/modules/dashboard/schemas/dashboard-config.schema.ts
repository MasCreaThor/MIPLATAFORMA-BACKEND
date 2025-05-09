// src/modules/dashboard/schemas/dashboard-config.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type DashboardConfigDocument = DashboardConfig & Document;

export enum WidgetType {
  RECENT_RESOURCES = 'recentResources',
  RECENT_KNOWLEDGE = 'recentKnowledge',
  ACTIVE_PROJECTS = 'activeProjects',
  POPULAR_TAGS = 'popularTags',
  USAGE_STATS = 'usageStats',
  QUICK_LINKS = 'quickLinks',
  NOTES = 'notes',
}

export class WidgetPosition {
  @Prop({ required: true })
  x: number;

  @Prop({ required: true })
  y: number;

  @Prop({ required: true })
  width: number;

  @Prop({ required: true })
  height: number;
}

export class Widget {
  @Prop({ required: true })
  id: string;

  @Prop({
    type: String,
    enum: Object.values(WidgetType),
    required: true,
  })
  type: WidgetType;

  @Prop({ required: true })
  title: string;

  @Prop({ type: Object, default: {} })
  configuration: Record<string, any>;

  @Prop({ type: WidgetPosition, required: true })
  position: WidgetPosition;
}

@Schema({ timestamps: true })
export class DashboardConfig {
  @Prop({ 
    type: MongooseSchema.Types.ObjectId, 
    ref: 'People', 
    required: true,
    unique: true 
  })
  peopleId: MongooseSchema.Types.ObjectId;

  @Prop({ type: [Object], default: [] })
  widgets: Widget[];

  @Prop({ type: Object, default: {} })
  layout: Record<string, any>;

  @Prop({ default: 'default' })
  theme: string;
}

export const DashboardConfigSchema = SchemaFactory.createForClass(DashboardConfig);