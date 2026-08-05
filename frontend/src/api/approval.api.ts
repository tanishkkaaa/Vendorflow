import { axiosClient } from './axiosClient';
import { ApiResponse, ApprovalWorkflow, PurchaseRequest } from '@/types';

export const approvalApi = {
  createRequest: (payload: {
    vendorId: string;
    title: string;
    amount: number;
    department?: string;
    justification?: string;
    rfqId?: string;
    quotationId?: string;
  }) =>
    axiosClient
      .post<ApiResponse<{ purchaseRequest: PurchaseRequest; workflow: ApprovalWorkflow }>>('/approvals', payload)
      .then((r) => r.data.data),

  getWorkflow: (id: string) =>
    axiosClient
      .get<ApiResponse<{ purchaseRequest: PurchaseRequest; workflow: ApprovalWorkflow }>>(`/approvals/${id}`)
      .then((r) => r.data.data),

  act: (id: string, decision: 'approve' | 'reject', comment?: string) =>
    axiosClient
      .post<ApiResponse<{ purchaseRequest: PurchaseRequest; workflow: ApprovalWorkflow }>>(`/approvals/${id}/act`, { decision, comment })
      .then((r) => r.data.data),

  myQueue: () => axiosClient.get<ApiResponse<PurchaseRequest[]>>('/approvals/queue').then((r) => r.data.data),
};
