// src/modules/users/schemas/user.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { People } from './people.schema';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class User {
  _id?: MongooseSchema.Types.ObjectId;
  id?: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: People.name, required: true })
  peopleId: MongooseSchema.Types.ObjectId;

  @Prop({ type: [String], default: ['user'] })
  roles: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLogin: Date;

  @Prop({
    type: {
      theme: { type: String, default: 'light' },
      language: { type: String, default: 'en' },
      dashboardLayout: { type: [Object], default: [] },
      notifications: { type: Boolean, default: true },
    },
    _id: false,
    default: {},
  })
  preferences: {
    theme: string;
    language: string;
    dashboardLayout: Record<string, any>[];
    notifications: boolean;
  };

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);