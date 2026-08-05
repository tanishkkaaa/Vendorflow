import { Schema, model, Document, Types } from 'mongoose';
import { PurchaseRequestStatus } from '@constants/enums';

export interface IPurchaseRequest extends Document {
  organizationId: Types.ObjectId;
  rfqId?: Types.ObjectId;
  quotationId?: Types.ObjectId;
  vendorId: Types.ObjectId;
  requestedBy: Types.ObjectId;
  title: string;
  amount: number;
  department?: string;
  justification?: string;
  status: PurchaseRequestStatus;
  currentStage: 'manager' | 'finance' | 'director' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const purchaseRequestSchema = new Schema<IPurchaseRequest>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    rfqId: { type: Schema.Types.ObjectId, ref: 'RFQ' },
    quotationId: { type: Schema.Types.ObjectId, ref: 'Quotation' },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    department: { type: String },
    justification: { type: String },
    status: {
      type: String,
      enum: Object.values(PurchaseRequestStatus),
      default: PurchaseRequestStatus.PENDING_APPROVAL,
      index: true,
    },
    currentStage: { type: String, enum: ['manager', 'finance', 'director', 'completed'], default: 'manager' },
  },
  { timestamps: true }
);

export const PurchaseRequest = model<IPurchaseRequest>('PurchaseRequest', purchaseRequestSchema);
