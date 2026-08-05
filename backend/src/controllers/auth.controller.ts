import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';
import { authService } from '@services/auth.service';
import { organizationRepository } from '@repositories/organization.repository';
import { ApiError } from '@utils/ApiError';

export const authController = {
  registerOrganization: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.registerOrganization(req.body);
    res.status(201).json(new ApiResponse('Organization and admin account created', result));
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json(new ApiResponse('Login successful', result));
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);
    res.status(200).json(new ApiResponse('Token refreshed', result));
  }),

  registerVendor: asyncHandler(async (req: Request, res: Response) => {
    // organizationId comes from an invite link / query param identifying which org the vendor is registering under
    const organizationId = (req.query.organizationId as string) || req.body.organizationId;
    if (!organizationId) throw ApiError.badRequest('organizationId is required to register as a vendor');
    const org = await organizationRepository.findById(organizationId);
    if (!org) throw ApiError.notFound('Organization not found');

    const result = await authService.registerVendor({ organizationId, ...req.body });
    res.status(201).json(new ApiResponse('Vendor account created', result));
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json(new ApiResponse('Current user', req.user));
  }),
};
