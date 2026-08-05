import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';
import { auditService } from '@services/audit.service';

export const auditLogController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { entityType, entityId, action } = req.query;
    const filters: Record<string, unknown> = {};
    if (entityType) filters.entityType = entityType;
    if (entityId) filters.entityId = entityId;
    if (action) filters.action = action;
    const result = await auditService.list(req, req.user!.organizationId, filters);
    res.status(200).json(new ApiResponse('Audit logs fetched', result.items, result.meta));
  }),
};
