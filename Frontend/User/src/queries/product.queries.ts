import { useMutation, useQuery } from '@tanstack/react-query';
import { getProducts } from '../api/products';
import { getAds, countClick, countView } from '../api/ads';
import { REACT_QUERY_KEYS } from './index';
import { useStores } from '@/stores';

export function useGetProducts() {
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.productQueries.getProduct],
    queryFn: getProducts,
    staleTime: 3000,
  });
}

export function useGetAds() {
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.productQueries.getAds],
    queryFn: getAds,
  });
}

export function useClickCount() {
  const { auth } = useStores();
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.productQueries.countClick],
    mutationFn: (id: string) => countClick(id, auth.token),
  });
}

export function useViewCount() {
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.productQueries.countView],
    mutationFn: (id: string) => countView(id),
  });
}
