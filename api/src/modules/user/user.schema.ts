import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = UserEntity & Document;

export enum Role {
  CUSTOMER = 'CUSTOMER',
  RECEPTIONIST = 'RECEPTIONIST',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
}

@Schema({ timestamps: true })
export class UserEntity {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ sparse: true, unique: true, default: null, index: true })
  phone: string | null;

  @Prop({ sparse: true, unique: true, default: null, index: true })
  email: string | null;

  @Prop({ default: null })
  photoUrl: string | null;

  @Prop({ enum: Role, default: Role.CUSTOMER })
  role: Role;

  @Prop({ sparse: true, unique: true, default: null, index: true })
  firebaseUid: string | null;

  @Prop({ default: null, select: false })
  passwordHash: string | null;

  @Prop({ type: Types.ObjectId, ref: 'Business', default: null })
  businessId: Types.ObjectId | null;

  @Prop({ default: null })
  fcmToken: string | null;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: null })
  lastLoginAt: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);

// Create indexes

