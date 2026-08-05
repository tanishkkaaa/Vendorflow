import { Schema, model, Document, Types } from 'mongoose';
import { ApprovalStage, ApprovalStatus } from '@constants/enums';

export interface IApprovalStep {
  stage: ApprovalStage;
  approverId?: Types.ObjectId;
  status: ApprovalStatus;
  comment?: string;
  actedAt?: Date;
}

export interface IApprovalWorkflow extends Document {
  organizationId: Types.ObjectId;
  purchaseRequestId: Types.ObjectId;
  steps: IApprovalStep[];
  finalStatus: ApprovalStatus;
  createdAt: Date;
  updatedAt: Date;
}

const approvalStepSchema = new Schema<IApprovalStep>(
  {
    stage: { type: String, enum: Object.values(ApprovalStage), required: true },
    approverId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: Object.values(ApprovalStatus), default: ApprovalStatus.PENDING },
    comment: { type: String },
    actedAt: { type: Date },
  },
  { _id: false }
);

const approvalWorkflowSchema = new Schema<IApprovalWorkflow>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    purchaseRequestId: { type: Schema.Types.ObjectId, ref: 'PurchaseRequest', required: true, unique: true },
    steps: { type: [approvalStepSchema], required: true },
    finalStatus: { type: String, enum: Object.values(ApprovalStatus), default: ApprovalStatus.PENDING },
  },
  { timestamps: true }
);

export const ApprovalWorkflow = model<IApprovalWorkflow>('ApprovalWorkflow', approvalWorkflowSchema);
