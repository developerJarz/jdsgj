import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  user?: mongoose.Types.ObjectId;
  userName?: string;
  userRole?: string;
  action: string;
  target: string;
  targetId?: string;
  details?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, default: 'System' },
    userRole: { type: String, default: 'admin' },
    action: { type: String, required: true },
    target: { type: String, required: true },
    targetId: { type: String },
    details: { type: String },
    changes: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ target: 1, action: 1 });

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
