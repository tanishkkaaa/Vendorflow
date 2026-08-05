import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rfqApi } from '@/api/rfq.api';
import { RFQ } from '@/types';

export function useRFQs(params: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['rfqs', params], queryFn: () => rfqApi.list(params) });
}

export function useInvitedRFQs(params: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['rfqs', 'invited', params], queryFn: () => rfqApi.listInvited(params) });
}

export function useRFQ(id?: string) {
  return useQuery({ queryKey: ['rfq', id], queryFn: () => rfqApi.getById(id!), enabled: !!id });
}

export function useCreateRFQ() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<RFQ>) => rfqApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rfqs'] }),
  });
}

export function usePublishRFQ() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: string; vendorIds: string[] }) => rfqApi.publish(payload.id, payload.vendorIds),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['rfqs'] });
      qc.invalidateQueries({ queryKey: ['rfq', vars.id] });
    },
  });
}

export function useCloseRFQ() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rfqApi.close(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['rfqs'] });
      qc.invalidateQueries({ queryKey: ['rfq', id] });
    },
  });
}
