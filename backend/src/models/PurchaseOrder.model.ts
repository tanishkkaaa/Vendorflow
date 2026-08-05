import { Schema, model, Document, Types } from 'mongoose';

export interface IPurchaseOrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IPurchaseOrder extends Document {
  organizationId: Types.ObjectId;
  purchaseRequestId: Types.ObjectId;
  vendorId: Types.ObjectId;
  poNumber: string;
  items: IPurchaseOrderItem[];
  subtotal: number;
  tax: number;
  grandTotal: number;
  deliveryDate?: Date;
  paymentTerms?: string;
  aiSummary?: string;
  pdfUrl?: string;
  pdfPublicId?: string;
  emailedToVendor: boolean;
  emailedAt?: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const poItemSchema = new Schema<IPurchaseOrderItem>(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const purchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    purchaseRequestId: { type: Schema.Types.ObjectId, ref: 'PurchaseRequest', required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    poNumber: { type: String, required: true, unique: true },
    items: { type: [poItemSchema], required: true },
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    deliveryDate: { type: Date },
    paymentTerms: { type: String },
    aiSummary: { type: String },
    pdfUrl: { type: String },
    pdfPublicId: { type: String },
    emailedToVendor: { type: Boolean, default: false },
    emailedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const PurchaseOrder = model<IPurchaseOrder>('PurchaseOrder', purchaseOrderSchema);
