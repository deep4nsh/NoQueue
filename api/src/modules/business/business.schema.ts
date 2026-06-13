import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BusinessDocument = Business & Document;

export enum BusinessType {
  CLINIC = 'CLINIC',
  LAB = 'LAB',
  SALON = 'SALON',
  DENTAL = 'DENTAL',
  PHYSIO = 'PHYSIO',
  VET = 'VET',
  SPA = 'SPA',
  AUTO = 'AUTO',
  REPAIR = 'REPAIR',
  OPTICAL = 'OPTICAL',
  OTHER = 'OTHER',
}

@Schema({ timestamps: true })
export class Business {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ enum: BusinessType, default: BusinessType.OTHER })
  type: BusinessType;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  logoUrl: string;

  @Prop({ required: true })
  address: string;

  @Prop({ default: 'IN' })
  country: string;

  @Prop({ default: 'Asia/Kolkata' })
  timezone: string;
}

export const BusinessSchema = SchemaFactory.createForClass(Business);
