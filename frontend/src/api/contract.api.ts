import { axiosClient } from './axiosClient';
import { ApiResponse, Contract, PaginatedMeta } from '@/types';

export const contractApi = {
  list: (params: Record<string, unknown> = {}) =>
    axiosClient.get<ApiResponse<Contract[]>>('/contracts', { params }).then((r) => ({ items: r.data.data, meta: r.data.meta as PaginatedMeta })),

  getById: (id: string) => axiosClient.get<ApiResponse<Contract>>(`/contracts/${id}`).then((r) => r.data.data),

  create: (payload: {
    vendorId: string;
    title: string;
    contractValue?: number;
    startDate: string;
    endDate: string;
    reminderDaysBefore?: number;
    file: File;
  }) => {
    const form = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (key === 'file') form.append('file', value as File);
      else if (value !== undefined) form.append(key, String(value));
    });
    return axiosClient
      .post<ApiResponse<Contract>>('/contracts', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data.data);
  },

  uploadNewVersion: (id: string, payload: { file: File; changeNote?: string; newEndDate?: string }) => {
    const form = new FormData();
    form.append('file', payload.file);
    if (payload.changeNote) form.append('changeNote', payload.changeNote);
    if (payload.newEndDate) form.append('newEndDate', payload.newEndDate);
    return axiosClient
      .post<ApiResponse<Contract>>(`/contracts/${id}/versions`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data.data);
  },
};
