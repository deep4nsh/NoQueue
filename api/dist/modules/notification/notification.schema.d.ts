import { Document, Types } from 'mongoose';
export type NotificationLogDocument = NotificationLog & Document;
export declare enum NotificationChannel {
    FCM = "FCM",
    WHATSAPP = "WHATSAPP",
    SMS = "SMS",
    EMAIL = "EMAIL"
}
export declare enum NotificationEvent {
    TOKEN_JOINED = "TOKEN_JOINED",
    APPROACHING = "APPROACHING",
    CALLED = "CALLED",
    MISSED = "MISSED",
    CANCELLED = "CANCELLED",
    QUEUE_DELAYED = "QUEUE_DELAYED"
}
export declare enum NotificationStatus {
    SENT = "SENT",
    FAILED = "FAILED",
    QUEUED = "QUEUED"
}
export declare class NotificationLog {
    tokenId: Types.ObjectId;
    channel: NotificationChannel;
    event: NotificationEvent;
    recipient: string;
    templateId: string;
    payload: Record<string, any>;
    status: NotificationStatus;
    providerResponse: Record<string, any>;
    sentAt: Date;
    failureReason: string;
    retryCount: number;
}
export declare const NotificationLogSchema: import("mongoose").Schema<NotificationLog, import("mongoose").Model<NotificationLog, any, any, any, Document<unknown, any, NotificationLog, any, {}> & NotificationLog & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, NotificationLog, Document<unknown, {}, import("mongoose").FlatRecord<NotificationLog>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<NotificationLog> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
