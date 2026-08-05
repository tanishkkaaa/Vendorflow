import { purchaseRequestRepository } from '@repositories/purchaseRequest.repository';
import { approvalWorkflowRepository } from '@repositories/approvalWorkflow.repository';
import { userRepository } from '@repositories/user.repository';
import { ApiError } from '@utils/ApiError';
import { ApprovalStage, ApprovalStatus, PurchaseRequestStatus, NotificationType } from '@constants/enums';
import { Role } from '@constants/roles';
import { enqueueNotification } from '@jobs/queues/notification.queue';

const STAGE_ORDER: ApprovalStage[] = [ApprovalStage.MANAGER, ApprovalStage.FINANCE, ApprovalStage.DIRECTOR];
const STAGE_ROLE: Record<ApprovalStage, Role> = {
  [ApprovalStage.MANAGER]: Role.PROCUREMENT_MANAGER,
  [ApprovalStage.FINANCE]: Role.FINANCE,
  [ApprovalStage.DIRECTOR]: Role.DIRECTOR,
};

export const approvalService = {
  /**
   * Purchase Request -> Manager -> Finance -> Director -> Approved -> PO Generated
   * Creates the request plus a 3-step ApprovalWorkflow, then notifies the
   * first-stage approver(s).
   */
  async createPurchaseRequest(
    organizationId: string,
    requestedBy: string,
    input: { vendorId: string; title: string; amount: number; department?: string; justification?: string; rfqId?: string; quotationId?: string }
  ) {
    const purchaseRequest = await purchaseRequestRepository.create({
      organizationId,
      requestedBy,
      status: PurchaseRequestStatus.PENDING_APPROVAL,
      currentStage: 'manager',
      ...input,
    } as any);

    const workflow = await approvalWorkflowRepository.create({
      organizationId,
      purchaseRequestId: purchaseRequest._id,
      steps: STAGE_ORDER.map((stage) => ({ stage, status: ApprovalStatus.PENDING })),
      finalStatus: ApprovalStatus.PENDING,
    } as any);

    await approvalService.notifyStageApprovers(organizationId, purchaseRequest, ApprovalStage.MANAGER);

    return { purchaseRequest, workflow };
  },

  async notifyStageApprovers(organizationId: string, purchaseRequest: any, stage: ApprovalStage) {
    const approvers = await userRepository.find({ organizationId, role: STAGE_ROLE[stage] });
    await enqueueNotification({
      organizationId,
      recipientIds: approvers.map((a) => String(a._id)),
      type: NotificationType.APPROVAL_REQUEST,
      title: 'Purchase Request Awaiting Your Approval',
      message: `"${purchaseRequest.title}" (amount: ${purchaseRequest.amount}) requires your approval.`,
      link: `/approvals/${purchaseRequest._id}`,
    });
  },

  async getWorkflow(purchaseRequestId: string, organizationId: string) {
    const purchaseRequest = await purchaseRequestRepository.findById(purchaseRequestId);
    if (!purchaseRequest || String(purchaseRequest.organizationId) !== organizationId) {
      throw ApiError.notFound('Purchase request not found');
    }
    const workflow = await approvalWorkflowRepository.findByPurchaseRequest(purchaseRequestId);
    if (!workflow) throw ApiError.notFound('Approval workflow not found');
    return { purchaseRequest, workflow };
  },

  /**
   * Approver acts on the CURRENT active stage only (enforces sequential
   * approval: Manager -> Finance -> Director). Rejecting at any stage
   * terminates the workflow immediately.
   */
  async act(
    purchaseRequestId: string,
    organizationId: string,
    approverId: string,
    approverRole: Role,
    decision: 'approve' | 'reject',
    comment?: string
  ) {
    const { purchaseRequest, workflow } = await approvalService.getWorkflow(purchaseRequestId, organizationId);

    if (workflow.finalStatus !== ApprovalStatus.PENDING) {
      throw ApiError.badRequest('This approval workflow has already been finalized');
    }

    const currentStageIndex = STAGE_ORDER.indexOf(purchaseRequest.currentStage as ApprovalStage);
    const currentStage = STAGE_ORDER[currentStageIndex];

    if (STAGE_ROLE[currentStage] !== approverRole) {
      throw ApiError.forbidden(`This request is currently awaiting ${currentStage} approval, not your role`);
    }

    const step = workflow.steps.find((s) => s.stage === currentStage)!;
    step.status = decision === 'approve' ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED;
    step.approverId = approverId as any;
    step.comment = comment;
    step.actedAt = new Date();

    if (decision === 'reject') {
      workflow.finalStatus = ApprovalStatus.REJECTED;
      purchaseRequest.status = PurchaseRequestStatus.REJECTED;
      purchaseRequest.currentStage = 'completed';
    } else {
      const nextStageIndex = currentStageIndex + 1;
      if (nextStageIndex < STAGE_ORDER.length) {
        purchaseRequest.currentStage = STAGE_ORDER[nextStageIndex];
        await approvalService.notifyStageApprovers(organizationId, purchaseRequest, STAGE_ORDER[nextStageIndex]);
      } else {
        workflow.finalStatus = ApprovalStatus.APPROVED;
        purchaseRequest.status = PurchaseRequestStatus.APPROVED;
        purchaseRequest.currentStage = 'completed';
      }
    }

    await workflow.save();
    await purchaseRequest.save();

    return { purchaseRequest, workflow };
  },

  async listForApprover(organizationId: string, role: Role) {
    const stage = (Object.keys(STAGE_ROLE) as ApprovalStage[]).find((s) => STAGE_ROLE[s] === role);
    if (!stage) return [];
    return purchaseRequestRepository.find({
      organizationId,
      currentStage: stage,
      status: PurchaseRequestStatus.PENDING_APPROVAL,
    });
  },
};
