import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vendorRatingApi } from '@/api/vendorRating.api';

export function useVendorRatings(vendorId?: string) {
  return useQuery({ queryKey: ['vendorRatings', vendorId], queryFn: () => vendorRatingApi.listForVendor(vendorId!), enabled: !!vendorId });
}

export function useRateVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: vendorRatingApi.rate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendorRatings'] }),
  });
}
