import { Model } from 'mongoose';
import { NotificationLogDocument, NotificationChannel, NotificationEvent, NotificationStatus } from './notification.schema';
export declare class NotificationService {
    private notificationLogModel;
    private firebaseApp;
    private readonly logger;
    constructor(notificationLogModel: Model<NotificationLogDocument>, firebaseApp: any);
    sendFcmNotification(fcmToken: string, title: string, body: string, data?: Record<string, string>): Promise<string | null>;
    logNotification(tokenId: string, channel: NotificationChannel, event: NotificationEvent, recipient: string, payload: Record<string, any>, status?: NotificationStatus): Promise<NotificationLogDocument>;
    getTokenNotifications(tokenId: string): Promise<NotificationLogDocument[]>;
    markAsSent(logId: string, providerResponse?: Record<string, any>): Promise<NotificationLogDocument>;
    markAsFailed(logId: string, reason: string): Promise<NotificationLogDocument>;
}
