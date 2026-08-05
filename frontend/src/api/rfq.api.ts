import { axiosClient } from './axiosClient';
import { ApiResponse, PaginatedMeta, RFQ } from '@/types';

export const rfqApi = {
  list: (params: Record<string, unknown> = {}) =>
    axiosClient.get<ApiResponse<RFQ[]>>('/rfqs', { params }).then((r) => ({ items: r.data.data, meta: r.data.meta as PaginatedMeta })),

  listInvited: (params: Record<string, unknown> = {}) =>
    axiosClient.get<ApiResponse<RFQ[]>>('/rfqs/invited', { params }).then((r) => ({ items: r.data.data, meta: r.data.meta as PaginatedMeta })),

  getById: (id: string) => axiosClient.get<ApiResponse<RFQ>>(`/rfqs/${id}`).then((r) => r.data.data),

  create: (payload: Partial<RFQ>) => axiosClient.post<ApiResponse<RFQ>>('/rfqs', payload).then((r) => r.data.data),

  publish: (id: string, vendorIds: string[]) =>
    axiosClient.post<ApiResponse<RFQ>>(`/rfqs/${id}/publish`, { vendorIds }).then((r) => r.data.data),

  close: (id: string) => axiosClient.post<ApiResponse<RFQ>>(`/rfqs/${id}/close`).then((r) => r.data.data),
};
