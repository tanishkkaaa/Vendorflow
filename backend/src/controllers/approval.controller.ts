import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';
import { approvalService } from '@services/approval.service';
import { recordAudit } from '@middlewares/audit.middleware';
import { AuditAction } from '@constants/enums';
import { Role } from '@constants/roles';

export const approvalController = {
  createRequest: asyncHandler(async (req: Request, res: Response) => {
    const result = await approvalService.createPurchaseRequest(req.user!.organizationId, req.user!.userId, req.body);
    res.status(201).json(new ApiResponse('Purchase request created and sent for approval', result));
  }),

  getWorkflow: asyncHandler(async (req: Request, res: Response) => {
    const result = await approvalService.getWorkflow(req.params.id, req.user!.organizationId);
    res.status(200).json(new ApiResponse('Approval workflow fetched', result));
  }),

  act: asyncHandler(async (req: Request, res: Response) => {
    const { decision, comment } = req.body;
    const result = await approvalService.act(
      req.params.id,
      req.user!.organizationId,
      req.user!.userId,
      req.user!.role as Role,
      decision,
      comment
    );
    await recordAudit({
      req,
      action: decision === 'approve' ? AuditAction.APPROVE : AuditAction.REJECT,
      entityType: 'PurchaseRequest',
      entityId: req.params.id,
      newValue: { stage: result.purchaseRequest.currentStage, status: result.purchaseRequest.status },
    });
    res.status(200).json(new ApiResponse(`Purchase request ${decision}d`, result));
  }),

  myQueue: asyncHandler(async (req: Request, res: Response) => {
    const items = await approvalService.listForApprover(req.user!.organizationId, req.user!.role as Role);
    res.status(200).json(new ApiResponse('Pending approvals fetched', items));
  }),
};
