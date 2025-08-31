import { useQuery } from '@tanstack/react-query';

import {
  getAdAnalytics,
  getBestseller,
  getMonthlySalesAnalytics,
  getOrderAnalytics,
  getSubscriptionAnalytics,
  getVendorRevenue,
} from '@/api/analytics';
import { useStores } from '@/stores';

import { REACT_QUERY_KEYS } from './index';

export function useGetVendorRevenue() {
  const { auth } = useStores();
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.analyticsQueries.getVendorRevenue],
    queryFn: () => getVendorRevenue(auth.token),
  });
}

export function useGetOrderAnalytics() {
  const { auth } = useStores();
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.analyticsQueries.getOrderAnalytics],
    queryFn: () => getOrderAnalytics(auth.token),
  });
}

export function useGetBestseller() {
  const { auth } = useStores();
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.analyticsQueries.getBestseller],
    queryFn: () => getBestseller(auth.token),
  });
}

export function useGetAdAnalytics() {
  const { auth } = useStores();
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.analyticsQueries.getAdAnalytics],
    queryFn: () => getAdAnalytics(auth.token),
  });
}

export function useGetSubscriptionAnalytics() {
  const { auth } = useStores();
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.analyticsQueries.getSubscriptionAnalytics],
    queryFn: () => getSubscriptionAnalytics(auth.token),
  });
}

export function useGetMonthlySalesAnalytics() {
  const { auth } = useStores();
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.analyticsQueries.getMonthlySalesAnalytics],
    queryFn: () => getMonthlySalesAnalytics(auth.token),
  });
}
