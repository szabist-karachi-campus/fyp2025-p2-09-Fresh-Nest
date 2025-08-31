import { useMutation, useQuery } from '@tanstack/react-query';

import { queryClient } from '@/App';
import { useStores } from '@/stores';

import {
  getAllThreads,
  getThreadById,
  getThreadByOrderId,
  sendMessage,
} from '../api/chats';
import { REACT_QUERY_KEYS } from './index';

export function useGetThreadByOrderIdMutation() {
  const { auth } = useStores();
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.chatsQueries.getThreadByOrderId],
    mutationFn: ({
      orderId,
      context,
    }: {
      orderId: string;
      context: 'Vendor' | 'SuperAdmin' | 'User';
    }) => getThreadByOrderId(orderId, auth.token, context),
  });
}

export function useGetAllThreads() {
  const { auth } = useStores();
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.chatsQueries.getAllThreads],
    queryFn: () => getAllThreads(auth.token),
  });
}

export const useGetThreadById = (threadId: string, options = {}) => {
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.chatsQueries.getThreadById, threadId],
    queryFn: () => getThreadById(threadId),
    enabled: !!threadId,
    ...options,
  });
};

export function useSendMessage() {
  const { auth } = useStores();
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.chatsQueries.sendMessage],
    mutationFn: (values: sendMessageRequest) => sendMessage(auth.token, values),
    onSuccess: (values) => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.chatsQueries.getAllThreads],
      });
      queryClient.invalidateQueries({
        queryKey: [
          REACT_QUERY_KEYS.chatsQueries.getThreadById,
          values.threadId,
        ],
      });
    },
  });
}
