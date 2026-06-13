import { Document, Types } from 'mongoose';
export type QueueDocument = QueueEntity & Document;
export declare enum QueueStatus {
    OPEN = "OPEN",
    PAUSED = "PAUSED",
    CLOSED = "CLOSED"
}
declare class QueueSettings {
    maxTokens: number;
    alertAheadCount: number;
    autoCloseAt: string | null;
    allowRemoteJoin: boolean;
    requirePhone: boolean;
    allowEmergencyTokens: boolean;
    emergencyTokenRoles: string[];
}
export declare class QueueEntity {
    branchId: Types.ObjectId;
    businessId: Types.ObjectId;
    name: string;
    prefix: string;
    currentToken: number;
    lastTokenIssued: number;
    lastEmergencyTokenIssued: number;
    averageServiceTime: number;
    status: QueueStatus;
    settings: QueueSettings;
    date: string;
}
export declare const QueueSchema: import("mongoose").Schema<QueueEntity, import("mongoose").Model<QueueEntity, any, any, any, Document<unknown, any, QueueEntity, any, {}> & QueueEntity & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, QueueEntity, Document<unknown, {}, import("mongoose").FlatRecord<QueueEntity>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<QueueEntity> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export {};
