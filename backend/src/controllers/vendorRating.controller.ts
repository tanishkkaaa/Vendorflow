import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';
import { vendorRatingService } from '@services/vendorRating.service';

export const vendorRatingController = {
  rate: asyncHandler(async (req: Request, res: Response) => {
    const rating = await vendorRatingService.rate(req.user!.organizationId, req.user!.userId, req.body);
    res.status(201).json(new ApiResponse('Vendor rated', rating));
  }),

  listForVendor: asyncHandler(async (req: Request, res: Response) => {
    const ratings = await vendorRatingService.listForVendor(req.params.vendorId);
    res.status(200).json(new ApiResponse('Vendor ratings fetched', ratings));
  }),
};
