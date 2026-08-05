import { axiosClient } from './axiosClient';
import { ApiResponse } from '@/types';

export interface AnalyticsSummary {
  currentMonthSpend: number;
  topVendors: Array<{ _id: string; companyName: string; score: number; ratingAverage: number; ratingCount: number }>;
  expiringContractsCount: number;
  averageApprovalTimeHours: number;
}

export const analyticsApi = {
  summary: () => axiosClient.get<ApiResponse<AnalyticsSummary>>('/analytics/summary').then((r) => r.data.data),

  monthlySpending: (months = 12) =>
    axiosClient
      .get<ApiResponse<Array<{ _id: { year: number; month: number }; totalSpend: number; orderCount: number }>>>(
        '/analytics/monthly-spending',
        { params: { months } }
      )
      .then((r) => r.data.data),

  departmentSpending: () =>
    axiosClient
      .get<ApiResponse<Array<{ _id: string; totalSpend: number; requestCount: number }>>>('/analytics/department-spending')
      .then((r) => r.data.data),

  vendorSpendRanking: (limit = 10) =>
    axiosClient
      .get<ApiResponse<Array<{ vendorName: string; totalSpend: number; orderCount: number }>>>('/analytics/vendor-spend-ranking', {
        params: { limit },
      })
      .then((r) => r.data.data),

  expiringContracts: (days = 30) =>
    axiosClient.get<ApiResponse<unknown[]>>('/analytics/expiring-contracts', { params: { days } }).then((r) => r.data.data),
};
