import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contractApi } from '@/api/contract.api';

export function useContracts(params: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contracts', params], queryFn: () => contractApi.list(params) });
}

export function useContract(id?: string) {
  return useQuery({ queryKey: ['contract', id], queryFn: () => contractApi.getById(id!), enabled: !!id });
}

export function useCreateContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: contractApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }),
  });
}

export function useUploadContractVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: string; file: File; changeNote?: string; newEndDate?: string }) =>
      contractApi.uploadNewVersion(payload.id, payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['contracts'] });
      qc.invalidateQueries({ queryKey: ['contract', vars.id] });
    },
  });
}
