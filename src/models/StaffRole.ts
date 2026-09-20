import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStaffRole extends Document {
  name: string;
  slug: string;
  description?: string;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StaffRoleSchema = new Schema<IStaffRole>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String },
    permissions: [{ type: String, required: true }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const StaffRole: Model<IStaffRole> =
  mongoose.models.StaffRole || mongoose.model<IStaffRole>('StaffRole', StaffRoleSchema);

export default StaffRole;
