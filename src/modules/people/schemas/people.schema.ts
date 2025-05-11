// src/modules/people/schemas/people.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export interface PeopleDocument extends People, Document {
  id: string;
}

@Schema()
class Address {
  @Prop()
  street: string;

  @Prop()
  city: string;

  @Prop()
  state: string;

  @Prop()
  zipCode: string;

  @Prop()
  country: string;
}

@Schema()
class Preferences {
  @Prop()
  theme: string;

  @Prop()
  language: string;

  @Prop({ type: [MongooseSchema.Types.Mixed] })
  dashboardLayout: any[];

  @Prop({ default: true })
  notifications: boolean;
}

@Schema({ timestamps: true })
export class People {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  phoneNumber: string;

  @Prop({ unique: true }) // Añadimos índice único aquí
  personalEmail: string;

  // Eliminamos el campo email que está causando el problema

  @Prop({ type: Address })
  address: Address;

  @Prop({ type: Date })
  birthDate: Date;

  @Prop()
  profileImageUrl: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  additionalInfo: Record<string, any>;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ type: [String], default: ['user'] })
  roles: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date })
  lastLogin: Date;

  @Prop({ type: Preferences, default: {} })
  preferences: Preferences;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const PeopleSchema = SchemaFactory.createForClass(People);