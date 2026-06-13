import { Document } from 'mongoose';
export type BusinessDocument = Business & Document;
export declare enum BusinessType {
    CLINIC = "CLINIC",
    LAB = "LAB",
    SALON = "SALON",
    DENTAL = "DENTAL",
    PHYSIO = "PHYSIO",
    VET = "VET",
    SPA = "SPA",
    AUTO = "AUTO",
    REPAIR = "REPAIR",
    OPTICAL = "OPTICAL",
    OTHER = "OTHER"
}
export declare class Business {
    name: string;
    slug: string;
    type: BusinessType;
    phone: string;
    email: string;
    logoUrl: string;
    address: string;
    country: string;
    timezone: string;
}
export declare const BusinessSchema: import("mongoose").Schema<Business, import("mongoose").Model<Business, any, any, any, Document<unknown, any, Business, any, {}> & Business & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Business, Document<unknown, {}, import("mongoose").FlatRecord<Business>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Business> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
