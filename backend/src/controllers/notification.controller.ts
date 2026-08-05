import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';
import { notificationService } from '@services/notification.service';

export const notificationController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await notificationService.list(req, req.user!.userId);
    res.status(200).json(new ApiResponse('Notifications fetched', result.items, { unreadCount: result.unreadCount, ...result.meta }));
  }),

  markRead: asyncHandler(async (req: Request, res: Response) => {
    const notification = await notificationService.markRead(req.params.id);
    res.status(200).json(new ApiResponse('Notification marked as read', notification));
  }),

  markAllRead: asyncHandler(async (req: Request, res: Response) => {
    await notificationService.markAllRead(req.user!.userId);
    res.status(200).json(new ApiResponse('All notifications marked as read'));
  }),
};
