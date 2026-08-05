import { useQuery } from '@tanstack/react-query';
import { auditLogApi } from '@/api/auditLog.api';

export function useAuditLogs(params: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['auditLogs', params], queryFn: () => auditLogApi.list(params) });
}
