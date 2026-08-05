import { Schema, model, Document, Types } from 'mongoose';
import { RFQStatus } from '@constants/enums';

export interface IRFQItem {
  name: string;
  quantity: number;
  specifications?: string;
}

export interface IRFQ extends Document {
  organizationId: Types.ObjectId;
  rfqCode: string;
  title: string;
  createdBy: Types.ObjectId;
  department?: string;
  items: IRFQItem[];
  budget?: number;
  deliveryDate?: Date;
  specifications?: string;
  invitedVendors: Types.ObjectId[];
  status: RFQStatus;
  submissionDeadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const rfqItemSchema = new Schema<IRFQItem>(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    specifications: { type: String },
  },
  { _id: false }
);

const rfqSchema = new Schema<IRFQ>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    rfqCode: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    department: { type: String },
    items: { type: [rfqItemSchema], required: true },
    budget: { type: Number },
    deliveryDate: { type: Date },
    specifications: { type: String },
    invitedVendors: [{ type: Schema.Types.ObjectId, ref: 'Vendor' }],
    status: { type: String, enum: Object.values(RFQStatus), default: RFQStatus.DRAFT, index: true },
    submissionDeadline: { type: Date },
  },
  { timestamps: true }
);

rfqSchema.index({ organizationId: 1, status: 1 });

export const RFQ = model<IRFQ>('RFQ', rfqSchema);
