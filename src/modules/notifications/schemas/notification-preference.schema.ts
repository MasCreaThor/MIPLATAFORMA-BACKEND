// src/modules/notifications/schemas/notification-preference.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type NotificationPreferenceDocument = NotificationPreference & Document;

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  // Otras opciones para el futuro: PUSH, SMS, etc.
}

export enum NotificationCategory {
  RESOURCES = 'resources',
  KNOWLEDGE = 'knowledge',
  PROJECTS = 'projects',
  TAGS = 'tags',
  CATEGORIES = 'categories',
  DASHBOARD = 'dashboard',
  SYSTEM = 'system',
}

@Schema({ timestamps: true })
export class NotificationPreference {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'People', required: true, unique: true })
  peopleId: MongooseSchema.Types.ObjectId;

  @Prop({ default: true })
  enabled: boolean;

  @Prop({ type: Object, default: {} })
  channelPreferences: Record<NotificationChannel, boolean>;

  @Prop({ type: Object, default: {} })
  categoryPreferences: Record<NotificationCategory, boolean>;

  @Prop({ default: false })
  doNotDisturb: boolean;

  @Prop({ type: Date, required: false })
  doNotDisturbStart?: Date;

  @Prop({ type: Date, required: false })
  doNotDisturbEnd?: Date;
  
  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const NotificationPreferenceSchema = SchemaFactory.createForClass(NotificationPreference);