import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { quotationApi } from '@/api/quotation.api';

export function useQuotationsForRFQ(rfqId?: string) {
  return useQuery({ queryKey: ['quotations', 'rfq', rfqId], queryFn: () => quotationApi.listForRFQ(rfqId!), enabled: !!rfqId });
}

export function useQuotationComparison(rfqId?: string, enabled = false) {
  return useQuery({
    queryKey: ['quotations', 'compare', rfqId],
    queryFn: () => quotationApi.compare(rfqId!),
    enabled: !!rfqId && enabled,
    retry: false,
  });
}

export function useSubmitQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { rfqId: string; price: number; deliveryTimelineDays: number; warrantyMonths?: number; file: File }) =>
      quotationApi.submit(payload),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['quotations', 'rfq', vars.rfqId] }),
  });
}
