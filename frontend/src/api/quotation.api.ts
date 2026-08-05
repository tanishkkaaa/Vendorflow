import { axiosClient } from './axiosClient';
import { ApiResponse, Quotation, QuotationComparisonResult } from '@/types';

export const quotationApi = {
  submit: (payload: { rfqId: string; price: number; deliveryTimelineDays: number; warrantyMonths?: number; file: File }) => {
    const form = new FormData();
    form.append('rfqId', payload.rfqId);
    form.append('price', String(payload.price));
    form.append('deliveryTimelineDays', String(payload.deliveryTimelineDays));
    if (payload.warrantyMonths !== undefined) form.append('warrantyMonths', String(payload.warrantyMonths));
    form.append('file', payload.file);
    return axiosClient
      .post<ApiResponse<Quotation>>('/quotations', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data.data);
  },

  listForRFQ: (rfqId: string) => axiosClient.get<ApiResponse<Quotation[]>>(`/quotations/rfq/${rfqId}`).then((r) => r.data.data),

  getById: (id: string) => axiosClient.get<ApiResponse<Quotation>>(`/quotations/${id}`).then((r) => r.data.data),

  compare: (rfqId: string) =>
    axiosClient.get<ApiResponse<QuotationComparisonResult>>(`/quotations/rfq/${rfqId}/compare`).then((r) => r.data.data),
};
