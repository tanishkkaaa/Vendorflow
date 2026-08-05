import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';
import { contractService } from '@services/contract.service';
import { ApiError } from '@utils/ApiError';

export const contractController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw ApiError.badRequest('Contract PDF file is required');
    const contract = await contractService.create(req.user!.organizationId, req.user!.userId, {
      vendorId: req.body.vendorId,
      title: req.body.title,
      contractValue: req.body.contractValue ? Number(req.body.contractValue) : undefined,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      reminderDaysBefore: req.body.reminderDaysBefore ? Number(req.body.reminderDaysBefore) : undefined,
      file: { buffer: req.file.buffer },
    });
    res.status(201).json(new ApiResponse('Contract uploaded; AI summary in progress', contract));
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const { status, vendorId } = req.query;
    const filters: Record<string, unknown> = {};
    if (status) filters.status = status;
    if (vendorId) filters.vendorId = vendorId;
    const result = await contractService.list(req, req.user!.organizationId, filters);
    res.status(200).json(new ApiResponse('Contracts fetched', result.items, result.meta));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const contract = await contractService.getById(req.params.id, req.user!.organizationId);
    res.status(200).json(new ApiResponse('Contract fetched', contract));
  }),

  uploadNewVersion: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw ApiError.badRequest('Contract PDF file is required');
    const contract = await contractService.uploadNewVersion(req.params.id, req.user!.organizationId, req.user!.userId, {
      file: { buffer: req.file.buffer },
      changeNote: req.body.changeNote,
      newEndDate: req.body.newEndDate ? new Date(req.body.newEndDate) : undefined,
    });
    res.status(200).json(new ApiResponse('New contract version uploaded', contract));
  }),
};
