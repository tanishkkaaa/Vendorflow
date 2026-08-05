import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';
import { userService } from '@services/user.service';
import { authService } from '@services/auth.service';

export const userController = {
  getProfile: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getProfile(req.user!.userId);
    res.status(200).json(new ApiResponse('Profile fetched', user));
  }),

  listOrgUsers: asyncHandler(async (req: Request, res: Response) => {
    const users = await userService.listOrgUsers(req.user!.organizationId, req.query);
    res.status(200).json(new ApiResponse('Users fetched', users));
  }),

  inviteUser: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.inviteInternalUser({ organizationId: req.user!.organizationId, ...req.body });
    res.status(201).json(new ApiResponse('User invited', user));
  }),

  deactivate: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.deactivate(req.params.id);
    res.status(200).json(new ApiResponse('User deactivated', user));
  }),

  activate: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.activate(req.params.id);
    res.status(200).json(new ApiResponse('User activated', user));
  }),
};
