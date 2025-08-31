import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createOrders,
  getOrders,
  updateOrderStatus,
  cancelOrder,
  cancelOrderById,
} from '../api/orders';
import { REACT_QUERY_KEYS } from './index';
import { useStores } from '@/stores';
import { queryClient } from '@/App';

export function useCreateOrder() {
  const { auth } = useStores();
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.orderQueries.createOrders],
    mutationFn: (values: createOrderRequest) =>
      createOrders(values, auth.token),
  });
}

export function useGetOrders() {
  const { auth } = useStores();
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.orderQueries.getOrders],
    queryFn: () => getOrders(auth.token),
  });
}

export function useUpdateOrderStatus(_id: any) {
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.orderQueries.updateOrderStatus],
    mutationFn: (values: Orders) =>
      updateOrderStatus(values.status, values._id),
  });
}

export function useCancelOrder() {
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.orderQueries.cancelOrder],
    mutationFn: (OrderNo: string) => cancelOrder(OrderNo),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.orderQueries.getOrders],
      });
    },
  });
}

export function useCancelOrderById() {
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.orderQueries.cancelOrderById],
    mutationFn: (id: string) => cancelOrderById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.orderQueries.getOrders],
      });
    },
  });
}
