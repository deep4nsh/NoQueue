import { Document, Types } from 'mongoose';
export type ServiceDocument = ServiceEntity & Document;
export declare enum ServiceCategory {
    CONSULTATION = "CONSULTATION",
    DIAGNOSTICS = "DIAGNOSTICS",
    PROCEDURE = "PROCEDURE",
    THERAPY = "THERAPY",
    GROOMING = "GROOMING",
    OTHER = "OTHER"
}
declare class ChargeConfig {
    amount: number;
    currency: string;
    isEditable: boolean;
    minAmount: number | null;
    maxAmount: number | null;
}
export declare class ServiceEntity {
    businessId: Types.ObjectId;
    branchId: Types.ObjectId | null;
    name: string;
    code: string;
    description: string;
    category: ServiceCategory;
    charge: ChargeConfig;
    estimatedDuration: number;
    isActive: boolean;
    sortOrder: number;
}
export declare const ServiceSchema: import("mongoose").Schema<ServiceEntity, import("mongoose").Model<ServiceEntity, any, any, any, Document<unknown, any, ServiceEntity, any, {}> & ServiceEntity & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ServiceEntity, Document<unknown, {}, import("mongoose").FlatRecord<ServiceEntity>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ServiceEntity> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export {};
