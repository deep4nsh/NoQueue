import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ServiceDocument = ServiceEntity & Document;

export enum ServiceCategory {
  CONSULTATION = 'CONSULTATION',
  DIAGNOSTICS = 'DIAGNOSTICS',
  PROCEDURE = 'PROCEDURE',
  THERAPY = 'THERAPY',
  GROOMING = 'GROOMING',
  OTHER = 'OTHER',
}

@Schema({ _id: false })
class ChargeConfig {
  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ default: 'INR' })
  currency: string;

  @Prop({ default: true })
  isEditable: boolean;

  @Prop({ type: Number, default: null })
  minAmount: number | null;

  @Prop({ type: Number, default: null })
  maxAmount: number | null;
}

@Schema({ timestamps: true })
export class ServiceEntity {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Business', index: true })
  businessId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Branch', default: null, index: true })
  branchId: Types.ObjectId | null;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, uppercase: true, maxlength: 8, trim: true })
  code: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ enum: ServiceCategory, default: ServiceCategory.OTHER })
  category: ServiceCategory;

  @Prop({ type: ChargeConfig, required: true })
  charge: ChargeConfig;

  @Prop({ required: true, min: 1, max: 480 })
  estimatedDuration: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  sortOrder: number;
}

export const ServiceSchema = SchemaFactory.createForClass(ServiceEntity);

ServiceSchema.index({ businessId: 1, isActive: 1 });
ServiceSchema.index({ businessId: 1, branchId: 1 });
