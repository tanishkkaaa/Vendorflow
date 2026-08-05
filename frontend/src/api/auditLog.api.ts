import { axiosClient } from './axiosClient';
import { ApiResponse, AuditLog, PaginatedMeta } from '@/types';

export const auditLogApi = {
  list: (params: Record<string, unknown> = {}) =>
    axiosClient
      .get<ApiResponse<AuditLog[]>>('/audit-logs', { params })
      .then((r) => ({ items: r.data.data, meta: r.data.meta as PaginatedMeta })),
};
