import { BaseRepository } from './base.repository';
import { ApprovalWorkflow, IApprovalWorkflow } from '@models/ApprovalWorkflow.model';

class ApprovalWorkflowRepository extends BaseRepository<IApprovalWorkflow> {
  constructor() {
    super(ApprovalWorkflow);
  }

  findByPurchaseRequest(purchaseRequestId: string) {
    return this.model.findOne({ purchaseRequestId }).exec();
  }
}

export const approvalWorkflowRepository = new ApprovalWorkflowRepository();
