import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/analytics.api';

export function useAnalyticsSummary() {
  return useQuery({ queryKey: ['analytics', 'summary'], queryFn: analyticsApi.summary });
}

export function useMonthlySpending(months = 12) {
  return useQuery({ queryKey: ['analytics', 'monthlySpending', months], queryFn: () => analyticsApi.monthlySpending(months) });
}

export function useDepartmentSpending() {
  return useQuery({ queryKey: ['analytics', 'departmentSpending'], queryFn: analyticsApi.departmentSpending });
}

export function useVendorSpendRanking(limit = 10) {
  return useQuery({ queryKey: ['analytics', 'vendorSpendRanking', limit], queryFn: () => analyticsApi.vendorSpendRanking(limit) });
}
