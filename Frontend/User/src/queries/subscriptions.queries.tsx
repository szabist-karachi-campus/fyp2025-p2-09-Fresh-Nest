import {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  cancelSubscription,
} from '@/api/subscriptions';
import { useMutation, useQuery } from '@tanstack/react-query';
import { REACT_QUERY_KEYS } from '.';
import { useStores } from '@/stores';
import { queryClient } from '@/App';

export function usegetSubscriptions(token: string) {
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.subscriptionsQueries.getUserSubscriptions],
    queryFn: () => getSubscriptions(token),
  });
}

export function useCreateSubscription() {
  const { auth } = useStores();
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.subscriptionsQueries.createSubscription],
    mutationFn: (values: CreateSubscriptionRequest) =>
      createSubscription(auth.token, values),
  });
}

export function useUpdateSubscription() {
  const { auth } = useStores();

  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.subscriptionsQueries.updateSubscription],
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: UpdateSubscriptionRequest;
    }) => updateSubscription(auth.token, id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.subscriptionsQueries.getUserSubscriptions],
      });
    },
  });
}

export function useCancelSubscription() {
  const { auth } = useStores();

  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.subscriptionsQueries.cancelSubscription],
    mutationFn: (id: string) => cancelSubscription(auth.token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.subscriptionsQueries.getUserSubscriptions],
      });
    },
  });
}
