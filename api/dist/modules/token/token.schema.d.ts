import { Document, Types } from 'mongoose';
export type TokenDocument = TokenEntity & Document;
export declare enum TokenPriority {
    NORMAL = "NORMAL",
    EMERGENCY = "EMERGENCY"
}
export declare enum TokenStatus {
    WAITING = "WAITING",
    CALLED = "CALLED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    SKIPPED = "SKIPPED",
    CANCELLED = "CANCELLED",
    NO_SHOW = "NO_SHOW"
}
export declare enum TokenSource {
    QR_SCAN = "QR_SCAN",
    RECEPTIONIST = "RECEPTIONIST",
    WHATSAPP_BOT = "WHATSAPP_BOT",
    WEB = "WEB",
    API = "API",
    EMERGENCY = "EMERGENCY"
}
export declare enum ChargeStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    WAIVED = "WAIVED"
}
declare class CustomerInfo {
    name: string;
    phone: string | null;
    email: string | null;
    userId: Types.ObjectId | null;
}
declare class ServiceSnapshot {
    serviceId: Types.ObjectId | null;
    name: string | null;
    code: string | null;
    estimatedDuration: number | null;
}
declare class ChargeInfo {
    defaultAmount: number | null;
    finalAmount: number | null;
    currency: string;
    status: ChargeStatus;
    editedBy: Types.ObjectId | null;
    editedAt: Date | null;
}
export declare class TokenEntity {
    queueId: Types.ObjectId;
    branchId: Types.ObjectId;
    businessId: Types.ObjectId;
    tokenNumber: number;
    displayToken: string;
    customer: CustomerInfo;
    status: TokenStatus;
    priority: TokenPriority;
    priorityReason: string | null;
    source: TokenSource;
    position: number;
    estimatedWaitMinutes: number;
    service: ServiceSnapshot | null;
    charge: ChargeInfo | null;
    notes: string;
    joinedAt: Date;
    calledAt: Date | null;
    completedAt: Date | null;
    skippedAt: Date | null;
    recalledCount: number;
}
export declare const TokenSchema: import("mongoose").Schema<TokenEntity, import("mongoose").Model<TokenEntity, any, any, any, Document<unknown, any, TokenEntity, any, {}> & TokenEntity & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, TokenEntity, Document<unknown, {}, import("mongoose").FlatRecord<TokenEntity>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<TokenEntity> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export {};
