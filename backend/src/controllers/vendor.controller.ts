import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';
import { vendorService } from '@services/vendor.service';
import { recordAudit } from '@middlewares/audit.middleware';
import { AuditAction } from '@constants/enums';
import { ApiError } from '@utils/ApiError';
import { userRepository } from '@repositories/user.repository';

export const vendorController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { status, category, search } = req.query;
    const filters: Record<string, unknown> = {};
    if (status) filters.status = status;
    if (category) filters.category = category;
    if (search) filters.$text = { $search: search as string };
    const result = await vendorService.listVendors(req, req.user!.organizationId, filters);
    res.status(200).json(new ApiResponse('Vendors fetched', result.items, result.meta));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const vendor = await vendorService.getVendor(req.params.id, req.user!.organizationId);
    res.status(200).json(new ApiResponse('Vendor fetched', vendor));
  }),

  getMyProfile: asyncHandler(async (req: Request, res: Response) => {
    // Vendor users have vendorId embedded via JWT-derived user lookup; fetched by userId->vendorId mapping
    const user = await userRepository.findById(req.user!.userId);
    if (!user?.vendorId) throw ApiError.notFound('No vendor profile linked to this account');
    const vendor = await vendorService.getVendor(String(user.vendorId), req.user!.organizationId);
    res.status(200).json(new ApiResponse('Vendor profile fetched', vendor));
  }),

  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const before = await vendorService.getVendor(req.params.id, req.user!.organizationId);
    const updated = await vendorService.updateProfile(req.params.id, req.user!.organizationId, req.body);
    await recordAudit({
      req,
      action: AuditAction.UPDATE,
      entityType: 'Vendor',
      entityId: req.params.id,
      oldValue: before.toObject(),
      newValue: updated.toObject(),
    });
    res.status(200).json(new ApiResponse('Vendor profile updated', updated));
  }),

  uploadDocument: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw ApiError.badRequest('No file uploaded');
    const { type, label } = req.body;
    const vendor = await vendorService.uploadDocument(
      req.params.id,
      req.user!.organizationId,
      { buffer: req.file.buffer, mimetype: req.file.mimetype },
      type,
      label
    );
    res.status(200).json(new ApiResponse('Document uploaded', vendor));
  }),

  checkDuplicates: asyncHandler(async (req: Request, res: Response) => {
    const result = await vendorService.checkForDuplicates(req.params.id, req.user!.organizationId);
    res.status(200).json(new ApiResponse('Duplicate check complete', result));
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const before = await vendorService.getVendor(req.params.id, req.user!.organizationId);
    const updated = await vendorService.updateStatus(
      req.params.id,
      req.user!.organizationId,
      req.body.status,
      req.body.rejectionReason
    );
    await recordAudit({
      req,
      action: AuditAction.STATUS_CHANGE,
      entityType: 'Vendor',
      entityId: req.params.id,
      oldValue: { status: before.status },
      newValue: { status: updated!.status },
    });
    res.status(200).json(new ApiResponse('Vendor status updated', updated));
  }),
};
