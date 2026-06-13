import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QueueDocument = QueueEntity & Document;

export enum QueueStatus {
  OPEN = 'OPEN',
  PAUSED = 'PAUSED',
  CLOSED = 'CLOSED',
}

@Schema({ _id: false })
class QueueSettings {
  @Prop({ default: 500 })
  maxTokens: number;

  @Prop({ default: 3 })
  alertAheadCount: number;

  @Prop({ default: null })
  autoCloseAt: string | null;

  @Prop({ default: true })
  allowRemoteJoin: boolean;

  @Prop({ default: true })
  requirePhone: boolean;

  @Prop({ default: true })
  allowEmergencyTokens: boolean;

  @Prop({ type: [String], default: ['RECEPTIONIST', 'BRANCH_MANAGER'] })
  emergencyTokenRoles: string[];
}

@Schema({ timestamps: true })
export class QueueEntity {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Branch', index: true })
  branchId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Business', index: true })
  businessId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: 'A' })
  prefix: string;

  @Prop({ default: 0 })
  currentToken: number;

  @Prop({ default: 0 })
  lastTokenIssued: number;

  @Prop({ default: 0 })
  lastEmergencyTokenIssued: number;

  @Prop({ default: 10 })
  averageServiceTime: number;

  @Prop({ enum: QueueStatus, default: QueueStatus.OPEN })
  status: QueueStatus;

  @Prop({ type: QueueSettings, default: () => ({}) })
  settings: QueueSettings;

  @Prop({ required: true })
  date: string;
}

export const QueueSchema = SchemaFactory.createForClass(QueueEntity);
