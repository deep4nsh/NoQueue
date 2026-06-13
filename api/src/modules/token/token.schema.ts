import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TokenDocument = TokenEntity & Document;

export enum TokenPriority {
  NORMAL = 'NORMAL',
  EMERGENCY = 'EMERGENCY',
}

export enum TokenStatus {
  WAITING = 'WAITING',
  CALLED = 'CALLED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum TokenSource {
  QR_SCAN = 'QR_SCAN',
  RECEPTIONIST = 'RECEPTIONIST',
  WHATSAPP_BOT = 'WHATSAPP_BOT',
  WEB = 'WEB',
  API = 'API',
  EMERGENCY = 'EMERGENCY',
}

export enum ChargeStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  WAIVED = 'WAIVED',
}

@Schema({ _id: false })
class CustomerInfo {
  @Prop({ required: true })
  name: string;

  @Prop({ default: null })
  phone: string | null;

  @Prop({ default: null })
  email: string | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  userId: Types.ObjectId | null;
}

@Schema({ _id: false })
class ServiceSnapshot {
  @Prop({ type: Types.ObjectId, ref: 'Service', default: null })
  serviceId: Types.ObjectId | null;

  @Prop({ default: null })
  name: string | null;

  @Prop({ default: null })
  code: string | null;

  @Prop({ default: null })
  estimatedDuration: number | null;
}

@Schema({ _id: false })
class ChargeInfo {
  @Prop({ default: null })
  defaultAmount: number | null;

  @Prop({ default: null })
  finalAmount: number | null;

  @Prop({ default: 'INR' })
  currency: string;

  @Prop({ enum: ChargeStatus, default: ChargeStatus.PENDING })
  status: ChargeStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  editedBy: Types.ObjectId | null;

  @Prop({ default: null })
  editedAt: Date | null;
}

@Schema({ timestamps: true })
export class TokenEntity {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Queue', index: true })
  queueId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Branch', index: true })
  branchId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Business', index: true })
  businessId: Types.ObjectId;

  @Prop({ required: true })
  tokenNumber: number;

  @Prop({ required: true })
  displayToken: string;

  @Prop({ type: CustomerInfo, required: true })
  customer: CustomerInfo;

  @Prop({ enum: TokenStatus, default: TokenStatus.WAITING, index: true })
  status: TokenStatus;

  @Prop({ enum: TokenPriority, default: TokenPriority.NORMAL, index: true })
  priority: TokenPriority;

  @Prop({ default: null })
  priorityReason: string | null;

  @Prop({ enum: TokenSource, default: TokenSource.RECEPTIONIST })
  source: TokenSource;

  @Prop({ default: 0 })
  position: number;

  @Prop({ default: 0 })
  estimatedWaitMinutes: number;

  @Prop({ type: ServiceSnapshot, default: null })
  service: ServiceSnapshot | null;

  @Prop({ type: ChargeInfo, default: null })
  charge: ChargeInfo | null;

  @Prop({ default: '' })
  notes: string;

  @Prop({ required: true })
  joinedAt: Date;

  @Prop({ default: null })
  calledAt: Date | null;

  @Prop({ default: null })
  completedAt: Date | null;

  @Prop({ default: null })
  skippedAt: Date | null;

  @Prop({ default: 0 })
  recalledCount: number;
}

export const TokenSchema = SchemaFactory.createForClass(TokenEntity);

TokenSchema.index({ queueId: 1, status: 1, priority: 1 });
TokenSchema.index({ queueId: 1, status: 1, joinedAt: 1 });
