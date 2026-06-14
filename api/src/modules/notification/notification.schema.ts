import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationLogDocument = NotificationLog & Document;

export enum NotificationChannel {
  FCM = 'FCM',
  WHATSAPP = 'WHATSAPP',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
}

export enum NotificationEvent {
  TOKEN_JOINED = 'TOKEN_JOINED',
  APPROACHING = 'APPROACHING',
  CALLED = 'CALLED',
  MISSED = 'MISSED',
  CANCELLED = 'CANCELLED',
  QUEUE_DELAYED = 'QUEUE_DELAYED',
}

export enum NotificationStatus {
  SENT = 'SENT',
  FAILED = 'FAILED',
  QUEUED = 'QUEUED',
}

@Schema({ timestamps: true })
export class NotificationLog {
  @Prop({ type: Types.ObjectId, ref: 'Token', required: true })
  tokenId: Types.ObjectId;

  @Prop({ enum: NotificationChannel, required: true })
  channel: NotificationChannel;

  @Prop({ enum: NotificationEvent, required: true })
  event: NotificationEvent;

  @Prop({ required: true })
  recipient: string;

  @Prop()
  templateId: string;

  @Prop({ type: Object })
  payload: Record<string, any>;

  @Prop({ enum: NotificationStatus, default: NotificationStatus.QUEUED })
  status: NotificationStatus;

  @Prop({ type: Object })
  providerResponse: Record<string, any>;

  @Prop()
  sentAt: Date;

  @Prop()
  failureReason: string;

  @Prop({ default: 0 })
  retryCount: number;
}

export const NotificationLogSchema = SchemaFactory.createForClass(NotificationLog);
