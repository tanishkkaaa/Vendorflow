import { axiosClient } from './axiosClient';
import { ApiResponse, VendorRating } from '@/types';

export const vendorRatingApi = {
  rate: (payload: { purchaseOrderId: string; delivery: number; quality: number; support: number; cost: number; comment?: string }) =>
    axiosClient.post<ApiResponse<VendorRating>>('/vendor-ratings', payload).then((r) => r.data.data),

  listForVendor: (vendorId: string) =>
    axiosClient.get<ApiResponse<VendorRating[]>>(`/vendor-ratings/vendor/${vendorId}`).then((r) => r.data.data),
};
