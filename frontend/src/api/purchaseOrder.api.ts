import { axiosClient } from './axiosClient';
import { ApiResponse, PurchaseOrder } from '@/types';

export const purchaseOrderApi = {
  list: (params: Record<string, unknown> = {}) =>
    axiosClient.get<ApiResponse<PurchaseOrder[]>>('/purchase-orders', { params }).then((r) => r.data.data),

  getById: (id: string) => axiosClient.get<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}`).then((r) => r.data.data),

  generate: (
    purchaseRequestId: string,
    payload: {
      items: { name: string; quantity: number; unitPrice: number }[];
      taxRate?: number;
      deliveryDate?: string;
      paymentTerms?: string;
    }
  ) =>
    axiosClient
      .post<ApiResponse<PurchaseOrder>>(`/purchase-orders/from-request/${purchaseRequestId}`, payload)
      .then((r) => r.data.data),
};
