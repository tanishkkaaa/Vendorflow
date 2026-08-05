import { axiosClient } from './axiosClient';
import { ApiResponse, PaginatedMeta, Vendor } from '@/types';

export const vendorApi = {
  list: (params: Record<string, unknown> = {}) =>
    axiosClient.get<ApiResponse<Vendor[]>>('/vendors', { params }).then((r) => ({ items: r.data.data, meta: r.data.meta as PaginatedMeta })),

  getById: (id: string) => axiosClient.get<ApiResponse<Vendor>>(`/vendors/${id}`).then((r) => r.data.data),

  getMyProfile: () => axiosClient.get<ApiResponse<Vendor>>('/vendors/me').then((r) => r.data.data),

  updateProfile: (id: string, payload: Partial<Vendor>) =>
    axiosClient.patch<ApiResponse<Vendor>>(`/vendors/${id}`, payload).then((r) => r.data.data),

  uploadDocument: (id: string, file: File, type: string, label: string) => {
    const form = new FormData();
    form.append('file', file);
    form.append('type', type);
    form.append('label', label);
    return axiosClient
      .post<ApiResponse<Vendor>>(`/vendors/${id}/documents`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data.data);
  },

  checkDuplicates: (id: string) =>
    axiosClient.post<ApiResponse<{ isDuplicate: boolean; matchedVendorId: string | null; reason: string }>>(
      `/vendors/${id}/check-duplicates`
    ).then((r) => r.data.data),

  updateStatus: (id: string, status: string, rejectionReason?: string) =>
    axiosClient.patch<ApiResponse<Vendor>>(`/vendors/${id}/status`, { status, rejectionReason }).then((r) => r.data.data),
};
