import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';
import { rfqService } from '@services/rfq.service';
import { recordAudit } from '@middlewares/audit.middleware';
import { AuditAction } from '@constants/enums';
import { userRepository } from '@repositories/user.repository';

export const rfqController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const rfq = await rfqService.create(req.user!.organizationId, req.user!.userId, req.body);
    await recordAudit({ req, action: AuditAction.CREATE, entityType: 'RFQ', entityId: String(rfq._id), newValue: rfq.toObject() });
    res.status(201).json(new ApiResponse('RFQ created', rfq));
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.query;
    const filters: Record<string, unknown> = {};
    if (status) filters.status = status;
    const result = await rfqService.list(req, req.user!.organizationId, filters);
    res.status(200).json(new ApiResponse('RFQs fetched', result.items, result.meta));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const rfq = await rfqService.getById(req.params.id, req.user!.organizationId);
    res.status(200).json(new ApiResponse('RFQ fetched', rfq));
  }),

  publish: asyncHandler(async (req: Request, res: Response) => {
    const rfq = await rfqService.publishAndInvite(req.params.id, req.user!.organizationId, req.body.vendorIds);
    await recordAudit({ req, action: AuditAction.STATUS_CHANGE, entityType: 'RFQ', entityId: req.params.id, newValue: { status: rfq.status } });
    res.status(200).json(new ApiResponse('RFQ published and vendors invited', rfq));
  }),

  close: asyncHandler(async (req: Request, res: Response) => {
    const rfq = await rfqService.close(req.params.id, req.user!.organizationId);
    res.status(200).json(new ApiResponse('RFQ closed', rfq));
  }),

  /** Vendor-facing: RFQs the logged-in vendor has been invited to. */
  listForVendor: asyncHandler(async (req: Request, res: Response) => {
    const user = await userRepository.findById(req.user!.userId);
    const result = await rfqService.list(req, req.user!.organizationId, { invitedVendors: user?.vendorId });
    res.status(200).json(new ApiResponse('Invited RFQs fetched', result.items, result.meta));
  }),
};
