import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vendorApi } from '@/api/vendor.api';

export function useVendors(params: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['vendors', params], queryFn: () => vendorApi.list(params) });
}

export function useVendor(id?: string) {
  return useQuery({ queryKey: ['vendor', id], queryFn: () => vendorApi.getById(id!), enabled: !!id });
}

export function useMyVendorProfile() {
  return useQuery({ queryKey: ['vendor', 'me'], queryFn: vendorApi.getMyProfile });
}

export function useUpdateVendorStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: string; status: string; rejectionReason?: string }) =>
      vendorApi.updateStatus(payload.id, payload.status, payload.rejectionReason),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['vendors'] });
      qc.invalidateQueries({ queryKey: ['vendor', vars.id] });
    },
  });
}

export function useCheckDuplicates() {
  return useMutation({ mutationFn: (id: string) => vendorApi.checkDuplicates(id) });
}

export function useUploadVendorDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: string; file: File; type: string; label: string }) =>
      vendorApi.uploadDocument(payload.id, payload.file, payload.type, payload.label),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['vendor', vars.id] }),
  });
}
