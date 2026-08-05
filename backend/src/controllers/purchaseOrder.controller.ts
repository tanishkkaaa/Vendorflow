import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';
import { purchaseOrderService } from '@services/purchaseOrder.service';

export const purchaseOrderController = {
  generate: asyncHandler(async (req: Request, res: Response) => {
    const { items, taxRate, deliveryDate, paymentTerms } = req.body;
    const po = await purchaseOrderService.generateFromApprovedRequest(
      req.params.purchaseRequestId,
      req.user!.organizationId,
      req.user!.userId,
      items,
      { taxRate, deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined, paymentTerms }
    );
    res.status(201).json(new ApiResponse('Purchase order generated and emailed to vendor', po));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const po = await purchaseOrderService.getById(req.params.id, req.user!.organizationId);
    res.status(200).json(new ApiResponse('Purchase order fetched', po));
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const pos = await purchaseOrderService.list(req.user!.organizationId, req.query as Record<string, unknown>);
    res.status(200).json(new ApiResponse('Purchase orders fetched', pos));
  }),
};
