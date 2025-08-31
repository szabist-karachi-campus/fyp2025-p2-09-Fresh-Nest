import { useMutation, useQuery } from '@tanstack/react-query';

import { useStores } from '@/stores';

import {
  cancelOrder,
  getOrders,
  getVendorSales,
  updateOrderStatus,
} from '../api/orders';
import { REACT_QUERY_KEYS } from './index';

export function useGetOrders() {
  const { auth } = useStores();
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.orderQueries.getOrders],
    queryFn: () => getOrders(auth.token),
  });
}

export function useUpdateOrderStatus() {
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.orderQueries.updateOrderStatus],
    mutationFn: (values: updateStatus) =>
      updateOrderStatus(values.status, values.orderId),
  });
}

export function useCancelOrder() {
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.orderQueries.cancelOrder],
    mutationFn: (orderNo: string) => cancelOrder(orderNo),
  });
}

export function useGetVendorSales() {
  const { auth } = useStores();
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.orderQueries.getVendorSales],
    queryFn: () => getVendorSales(auth.token),
  });
}
