import mongoose, { Schema, Model } from 'mongoose';
import { ADMIN_SECTIONS, type AdminSectionId } from '@/lib/adminSections';

interface IAdminSettings {
  _id: string;
  disabledSections: AdminSectionId[];
  allowAdminAuditDelete: boolean;
  updatedBy?: string;
  updatedAt: Date;
}

const schema = new Schema<IAdminSettings>({
  _id: { type: String, required: true },
  disabledSections: [{ type: String, enum: ADMIN_SECTIONS.map((section) => section.id) }],
  allowAdminAuditDelete: { type: Boolean, default: false },
  updatedBy: { type: String },
}, { timestamps: true });

const existingModel = mongoose.models.AdminSettings as Model<IAdminSettings> | undefined;
if (existingModel && !existingModel.schema.path('allowAdminAuditDelete')) {
  existingModel.schema.add({ allowAdminAuditDelete: schema.obj.allowAdminAuditDelete });
}
const AdminSettings: Model<IAdminSettings> = existingModel || mongoose.model<IAdminSettings>('AdminSettings', schema);
export default AdminSettings;
