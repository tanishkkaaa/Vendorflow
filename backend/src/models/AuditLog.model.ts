import { Schema, model, Document, Types } from 'mongoose';
import { AuditAction } from '@constants/enums';

export interface IAuditLog extends Document {
  organizationId: Types.ObjectId;
  actorId: Types.ObjectId;
  actorName: string;
  action: AuditAction;
  entityType: string; // e.g. 'Vendor', 'PurchaseRequest', 'Contract'
  entityId: Types.ObjectId;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actorName: { type: String, required: true },
    action: { type: String, enum: Object.values(AuditAction), required: true },
    entityType: { type: String, required: true, index: true },
    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ organizationId: 1, createdAt: -1 });

export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema);
