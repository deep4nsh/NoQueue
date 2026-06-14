import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BranchDocument = Branch & Document;

@Schema({ timestamps: true })
export class Branch {
  @Prop({ type: Types.ObjectId, ref: 'Business', required: true })
  businessId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  })
  location: {
    type: string;
    coordinates: [number, number];
  };

  @Prop()
  phone: string;

  @Prop({
    type: Map,
    of: Object,
    default: new Map(),
  })
  openingHours: Map<string, { open: string; close: string; closed: boolean }>;

  @Prop({ type: [Date], default: [] })
  holidays: Date[];

  @Prop()
  qrCode: string;

  @Prop({ type: [Types.ObjectId], ref: 'UserEntity', default: [] })
  staff: Types.ObjectId[];

  @Prop({ default: true })
  isActive: boolean;
}

export const BranchSchema = SchemaFactory.createForClass(Branch);
BranchSchema.index({ 'location': '2dsphere' });
