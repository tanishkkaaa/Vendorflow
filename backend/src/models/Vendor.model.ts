import { Schema, model, Document, Types } from 'mongoose';
import { VendorStatus } from '@constants/enums';

export interface IVendorDocument {
  type: 'gst' | 'pan' | 'certificate' | 'bank_proof' | 'other';
  label: string;
  fileUrl: string;
  publicId?: string;
  uploadedAt: Date;
}

export interface IVendor extends Document {
  organizationId: Types.ObjectId;
  userId: Types.ObjectId; // linked login account
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstNumber?: string;
  panNumber?: string;
  address?: string;
  category?: string;
  bankDetails?: {
    accountHolder?: string;
    accountNumber?: string;
    ifsc?: string;
    bankName?: string;
  };
  documents: IVendorDocument[];
  status: VendorStatus;
  rejectionReason?: string;
  ratingAverage: number;
  ratingCount: number;
  score: number; // computed vendor performance score 0-100
  isDuplicateFlagged: boolean;
  duplicateOfVendorId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const vendorDocumentSchema = new Schema<IVendorDocument>(
  {
    type: { type: String, enum: ['gst', 'pan', 'certificate', 'bank_proof', 'other'], required: true },
    label: { type: String, required: true },
    fileUrl: { type: String, required: true },
    publicId: { type: String },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const vendorSchema = new Schema<IVendor>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    companyName: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    gstNumber: { type: String, trim: true, uppercase: true },
    panNumber: { type: String, trim: true, uppercase: true },
    address: { type: String },
    category: { type: String },
    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      ifsc: String,
      bankName: String,
    },
    documents: { type: [vendorDocumentSchema], default: [] },
    status: { type: String, enum: Object.values(VendorStatus), default: VendorStatus.PENDING, index: true },
    rejectionReason: { type: String },
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    isDuplicateFlagged: { type: Boolean, default: false },
    duplicateOfVendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
  },
  { timestamps: true }
);

vendorSchema.index({ organizationId: 1, status: 1 });
vendorSchema.index({ organizationId: 1, gstNumber: 1 });
vendorSchema.index({ companyName: 'text', email: 'text' });

export const Vendor = model<IVendor>('Vendor', vendorSchema);
