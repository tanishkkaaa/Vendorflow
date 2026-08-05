import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';
import { analyticsService } from '@services/analytics.service';

export const analyticsController = {
  summary: asyncHandler(async (req: Request, res: Response) => {
    const data = await analyticsService.summary(req.user!.organizationId);
    res.status(200).json(new ApiResponse('Analytics summary fetched', data));
  }),
  monthlySpending: asyncHandler(async (req: Request, res: Response) => {
    const data = await analyticsService.monthlySpending(req.user!.organizationId, Number(req.query.months) || 12);
    res.status(200).json(new ApiResponse('Monthly spending fetched', data));
  }),
  departmentSpending: asyncHandler(async (req: Request, res: Response) => {
    const data = await analyticsService.departmentSpending(req.user!.organizationId);
    res.status(200).json(new ApiResponse('Department spending fetched', data));
  }),
  topVendors: asyncHandler(async (req: Request, res: Response) => {
    const data = await analyticsService.topVendorsByRating(req.user!.organizationId, Number(req.query.limit) || 10);
    res.status(200).json(new ApiResponse('Top vendors fetched', data));
  }),
  vendorSpendRanking: asyncHandler(async (req: Request, res: Response) => {
    const data = await analyticsService.vendorSpendRanking(req.user!.organizationId, Number(req.query.limit) || 10);
    res.status(200).json(new ApiResponse('Vendor spend ranking fetched', data));
  }),
  purchaseTrends: asyncHandler(async (req: Request, res: Response) => {
    const data = await analyticsService.purchaseTrends(req.user!.organizationId, Number(req.query.months) || 6);
    res.status(200).json(new ApiResponse('Purchase trends fetched', data));
  }),
  expiringContracts: asyncHandler(async (req: Request, res: Response) => {
    const data = await analyticsService.contractsExpiringSoon(req.user!.organizationId, Number(req.query.days) || 30);
    res.status(200).json(new ApiResponse('Expiring contracts fetched', data));
  }),
};
