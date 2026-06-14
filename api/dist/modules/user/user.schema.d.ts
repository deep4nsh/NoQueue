import { Document, Types } from 'mongoose';
export type UserDocument = UserEntity & Document;
export declare enum Role {
    CUSTOMER = "CUSTOMER",
    RECEPTIONIST = "RECEPTIONIST",
    OWNER = "OWNER",
    ADMIN = "ADMIN"
}
export declare class UserEntity {
    name: string;
    phone: string | null;
    email: string | null;
    photoUrl: string | null;
    role: Role;
    firebaseUid: string | null;
    passwordHash: string | null;
    businessId: Types.ObjectId | null;
    fcmToken: string | null;
    isActive: boolean;
    lastLoginAt: Date | null;
}
export declare const UserSchema: import("mongoose").Schema<UserEntity, import("mongoose").Model<UserEntity, any, any, any, Document<unknown, any, UserEntity, any, {}> & UserEntity & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, UserEntity, Document<unknown, {}, import("mongoose").FlatRecord<UserEntity>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<UserEntity> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
