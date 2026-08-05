import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';
import { quotationService } from '@services/quotation.service';
import { ApiError } from '@utils/ApiError';
import { userRepository } from '@repositories/user.repository';

export const quotationController = {
  submit: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw ApiError.badRequest('Quotation PDF file is required');
    const user = await userRepository.findById(req.user!.userId);
    if (!user?.vendorId) throw ApiError.forbidden('Only vendor accounts can submit quotations');

    const quotation = await quotationService.submit(req.user!.organizationId, String(user.vendorId), {
      rfqId: req.body.rfqId,
      price: Number(req.body.price),
      deliveryTimelineDays: Number(req.body.deliveryTimelineDays),
      warrantyMonths: req.body.warrantyMonths ? Number(req.body.warrantyMonths) : undefined,
      file: { buffer: req.file.buffer },
    });
    res.status(201).json(new ApiResponse('Quotation submitted; AI extraction in progress', quotation));
  }),

  listForRFQ: asyncHandler(async (req: Request, res: Response) => {
    const quotations = await quotationService.listForRFQ(req.params.rfqId);
    res.status(200).json(new ApiResponse('Quotations fetched', quotations));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const quotation = await quotationService.getById(req.params.id);
    res.status(200).json(new ApiResponse('Quotation fetched', quotation));
  }),

  compare: asyncHandler(async (req: Request, res: Response) => {
    const comparison = await quotationService.compareForRFQ(req.params.rfqId, req.user!.organizationId);
    res.status(200).json(new ApiResponse('AI comparison generated', comparison));
  }),
};
