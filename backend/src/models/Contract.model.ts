import { Schema, model, Document, Types } from 'mongoose';
import { ContractStatus } from '@constants/enums';

export interface IContractVersion {
  version: number;
  fileUrl: string;
  publicId?: string;
  uploadedBy: Types.ObjectId;
  uploadedAt: Date;
  changeNote?: string;
  aiSummary?: string;
  aiRiskFlags?: string[];
}

export interface IContract extends Document {
  organizationId: Types.ObjectId;
  vendorId: Types.ObjectId;
  title: string;
  contractValue?: number;
  startDate: Date;
  endDate: Date;
  reminderDaysBefore: number;
  status: ContractStatus;
  versions: IContractVersion[];
  currentVersion: number;
  lastReminderSentAt?: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const contractVersionSchema = new Schema<IContractVersion>(
  {
    version: { type: Number, required: true },
    fileUrl: { type: String, required: true },
    publicId: { type: String },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedAt: { type: Date, default: Date.now },
    changeNote: { type: String },
    aiSummary: { type: String },
    aiRiskFlags: { type: [String], default: [] },
  },
  { _id: false }
);

const contractSchema = new Schema<IContract>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    title: { type: String, required: true },
    contractValue: { type: Number },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true, index: true },
    reminderDaysBefore: { type: Number, default: 30 },
    status: { type: String, enum: Object.values(ContractStatus), default: ContractStatus.ACTIVE, index: true },
    versions: { type: [contractVersionSchema], default: [] },
    currentVersion: { type: Number, default: 1 },
    lastReminderSentAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

contractSchema.index({ organizationId: 1, endDate: 1 });

export const Contract = model<IContract>('Contract', contractSchema);
