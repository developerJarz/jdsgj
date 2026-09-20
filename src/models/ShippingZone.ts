import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IShippingZone extends Document {
  name: string;
  code: string;
  areas: string[];
  shippingFee: number;
  freeShippingThreshold?: number;
  estimatedDays: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ShippingZoneSchema = new Schema<IShippingZone>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    areas: [{ type: String, required: true }],
    shippingFee: { type: Number, required: true, min: 0 },
    freeShippingThreshold: { type: Number, default: 0 },
    estimatedDays: { type: String, default: '2-4 Days' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ShippingZone: Model<IShippingZone> =
  mongoose.models.ShippingZone || mongoose.model<IShippingZone>('ShippingZone', ShippingZoneSchema);

export default ShippingZone;
