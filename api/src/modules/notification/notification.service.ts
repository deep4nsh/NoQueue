import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotificationLog, NotificationLogDocument, NotificationChannel, NotificationEvent, NotificationStatus } from './notification.schema';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(NotificationLog.name)
    private notificationLogModel: Model<NotificationLogDocument>,
    @Inject('FIREBASE_APP') private firebaseApp: any,
  ) {}

  async sendFcmNotification(
    fcmToken: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<string | null> {
    if (!this.firebaseApp) {
      this.logger.warn('Firebase not configured, FCM notification skipped');
      return null;
    }

    try {
      const messaging = this.firebaseApp.messaging();
      const message = {
        notification: { title, body },
        data: data || {},
        token: fcmToken,
      };

      const messageId = await messaging.send(message);
      this.logger.debug(`FCM sent: ${messageId}`);
      return messageId;
    } catch (error) {
      this.logger.error(`FCM failed: ${error.message}`);
      return null;
    }
  }

  async logNotification(
    tokenId: string,
    channel: NotificationChannel,
    event: NotificationEvent,
    recipient: string,
    payload: Record<string, any>,
    status: NotificationStatus = NotificationStatus.QUEUED,
  ): Promise<NotificationLogDocument> {
    const log = new this.notificationLogModel({
      tokenId: new Types.ObjectId(tokenId),
      channel,
      event,
      recipient,
      payload,
      status,
    });
    return log.save();
  }

  async getTokenNotifications(tokenId: string): Promise<NotificationLogDocument[]> {
    return this.notificationLogModel
      .find({ tokenId: new Types.ObjectId(tokenId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async markAsSent(logId: string, providerResponse?: Record<string, any>): Promise<NotificationLogDocument> {
    return this.notificationLogModel
      .findByIdAndUpdate(
        logId,
        {
          status: NotificationStatus.SENT,
          sentAt: new Date(),
          providerResponse,
        },
        { new: true },
      )
      .exec();
  }

  async markAsFailed(logId: string, reason: string): Promise<NotificationLogDocument> {
    return this.notificationLogModel
      .findByIdAndUpdate(
        logId,
        {
          status: NotificationStatus.FAILED,
          failureReason: reason,
          $inc: { retryCount: 1 },
        },
        { new: true },
      )
      .exec();
  }
}
