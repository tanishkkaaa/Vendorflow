import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { approvalApi } from '@/api/approval.api';

export function useApprovalQueue() {
  return useQuery({ queryKey: ['approvals', 'queue'], queryFn: approvalApi.myQueue });
}

export function useApprovalWorkflow(id?: string) {
  return useQuery({ queryKey: ['approvals', id], queryFn: () => approvalApi.getWorkflow(id!), enabled: !!id });
}

export function useCreatePurchaseRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: approvalApi.createRequest,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['approvals'] }),
  });
}

export function useActOnApproval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: string; decision: 'approve' | 'reject'; comment?: string }) =>
      approvalApi.act(payload.id, payload.decision, payload.comment),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['approvals'] });
      qc.invalidateQueries({ queryKey: ['approvals', vars.id] });
    },
  });
}
