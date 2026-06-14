import { Document, Types } from 'mongoose';
export type BranchDocument = Branch & Document;
export declare class Branch {
    businessId: Types.ObjectId;
    name: string;
    address: string;
    location: {
        type: string;
        coordinates: [number, number];
    };
    phone: string;
    openingHours: Map<string, {
        open: string;
        close: string;
        closed: boolean;
    }>;
    holidays: Date[];
    qrCode: string;
    staff: Types.ObjectId[];
    isActive: boolean;
}
export declare const BranchSchema: import("mongoose").Schema<Branch, import("mongoose").Model<Branch, any, any, any, Document<unknown, any, Branch, any, {}> & Branch & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Branch, Document<unknown, {}, import("mongoose").FlatRecord<Branch>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Branch> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
