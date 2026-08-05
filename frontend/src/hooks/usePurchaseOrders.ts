import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { purchaseOrderApi } from '@/api/purchaseOrder.api';

export function usePurchaseOrders(params: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['purchaseOrders', params], queryFn: () => purchaseOrderApi.list(params) });
}

export function usePurchaseOrder(id?: string) {
  return useQuery({ queryKey: ['purchaseOrder', id], queryFn: () => purchaseOrderApi.getById(id!), enabled: !!id });
}

export function useGeneratePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      purchaseRequestId: string;
      items: { name: string; quantity: number; unitPrice: number }[];
      taxRate?: number;
      deliveryDate?: string;
      paymentTerms?: string;
    }) => purchaseOrderApi.generate(payload.purchaseRequestId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purchaseOrders'] }),
  });
}
