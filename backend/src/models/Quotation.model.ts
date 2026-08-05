import { Schema, model, Document, Types } from 'mongoose';
import { QuotationStatus } from '@constants/enums';

export interface IExtractedQuoteData {
  price?: number;
  currency?: string;
  warrantyMonths?: number;
  deliveryDays?: number;
  paymentTerms?: string;
  penaltyClause?: string;
  otherTerms?: string;
  rawSummary?: string;
  extractionConfidence?: number; // 0-1
  extractedAt?: Date;
}

export interface IQuotation extends Document {
  organizationId: Types.ObjectId;
  rfqId: Types.ObjectId;
  vendorId: Types.ObjectId;
  price: number;
  deliveryTimelineDays: number;
  warrantyMonths?: number;
  quotationPdfUrl: string;
  quotationPdfPublicId?: string;
  extracted: IExtractedQuoteData;
  status: QuotationStatus;
  aiRank?: number;
  aiRecommendationNotes?: string;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const extractedSchema = new Schema<IExtractedQuoteData>(
  {
    price: Number,
    currency: { type: String, default: 'INR' },
    warrantyMonths: Number,
    deliveryDays: Number,
    paymentTerms: String,
    penaltyClause: String,
    otherTerms: String,
    rawSummary: String,
    extractionConfidence: Number,
    extractedAt: Date,
  },
  { _id: false }
);

const quotationSchema = new Schema<IQuotation>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    rfqId: { type: Schema.Types.ObjectId, ref: 'RFQ', required: true, index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    price: { type: Number, required: true },
    deliveryTimelineDays: { type: Number, required: true },
    warrantyMonths: { type: Number },
    quotationPdfUrl: { type: String, required: true },
    quotationPdfPublicId: { type: String },
    extracted: { type: extractedSchema, default: () => ({}) },
    status: { type: String, enum: Object.values(QuotationStatus), default: QuotationStatus.SUBMITTED },
    aiRank: { type: Number },
    aiRecommendationNotes: { type: String },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

quotationSchema.index({ rfqId: 1, vendorId: 1 }, { unique: true });

export const Quotation = model<IQuotation>('Quotation', quotationSchema);
