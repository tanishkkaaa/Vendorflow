import { Schema, model, Document, Types } from 'mongoose';

export interface IVendorRating extends Document {
  organizationId: Types.ObjectId;
  vendorId: Types.ObjectId;
  purchaseOrderId: Types.ObjectId;
  ratedBy: Types.ObjectId;
  delivery: number; // 1-5
  quality: number;
  support: number;
  cost: number;
  overall: number; // computed average
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const vendorRatingSchema = new Schema<IVendorRating>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    purchaseOrderId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
    ratedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    delivery: { type: Number, min: 1, max: 5, required: true },
    quality: { type: Number, min: 1, max: 5, required: true },
    support: { type: Number, min: 1, max: 5, required: true },
    cost: { type: Number, min: 1, max: 5, required: true },
    overall: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
  },
  { timestamps: true }
);

vendorRatingSchema.index({ purchaseOrderId: 1 }, { unique: true });

vendorRatingSchema.pre('validate', function (next) {
  this.overall = Number(((this.delivery + this.quality + this.support + this.cost) / 4).toFixed(2));
  next();
});

export const VendorRating = model<IVendorRating>('VendorRating', vendorRatingSchema);
