// src/modules/notifications/schemas/notification.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'People', required: true, index: true })
  peopleId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({
    type: String,
    enum: Object.values(NotificationType),
    default: NotificationType.INFO,
  })
  type: NotificationType;

  @Prop({
    type: String,
    enum: Object.values(NotificationPriority),
    default: NotificationPriority.MEDIUM,
  })
  priority: NotificationPriority;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: String, required: false })
  relatedEntityType?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: false })
  relatedEntityId?: MongooseSchema.Types.ObjectId;

  @Prop({ type: Object, default: {} })
  additionalData: Record<string, any>;

  @Prop({ type: Date, required: false })
  expiresAt?: Date;

  @Prop({ type: Date, default: Date.now, index: true })
  createdAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Crear índices para consultas comunes
NotificationSchema.index({ peopleId: 1, isRead: 1 });
NotificationSchema.index({ peopleId: 1, createdAt: -1 });