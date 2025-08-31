import { useMutation, useQuery } from '@tanstack/react-query';

import {
  createAd,
  getAdByProduct,
  getAdPerformance,
  getBidRange,
  updateAd,
} from '@/api/ads';
import { useStores } from '@/stores';

import { REACT_QUERY_KEYS } from './index';

export function useGetBidRange() {
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.adQueries.getBidRange],
    queryFn: getBidRange,
  });
}

export function useCreateAd() {
  const { auth } = useStores();
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.adQueries.createAd],
    mutationFn: (values: any) => createAd(auth.token, values),
  });
}

export function useUpdateAd() {
  const { auth } = useStores();
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.adQueries.updateAd],
    mutationFn: ({ values, id }: { values: any; id: string }) =>
      updateAd(auth.token, id, values),
  });
}

export function useGetAdPerformance(adId: string) {
  const { auth } = useStores();
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.adQueries.getAdPerformance, adId],
    queryFn: () => getAdPerformance(auth.token, adId),
  });
}

export function useGetAdByProduct(productId: string) {
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.adQueries.getAdByProduct, productId],
    queryFn: () => getAdByProduct(productId),
  });
}
