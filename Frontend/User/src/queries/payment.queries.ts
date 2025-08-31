import { useMutation } from '@tanstack/react-query';
import { REACT_QUERY_KEYS } from '.';
import { createPaymentIntent, topUpWallet } from '@/api/payment';
import { useStores } from '@/stores';
import { queryClient } from '@/App';

export function useCreatePaymentIntent() {
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.paymentQueries.createPayment],
    mutationFn: (values: createPaymentIntentRequest) =>
      createPaymentIntent(values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          REACT_QUERY_KEYS.authQueries.getWalletBalance,
          REACT_QUERY_KEYS.authQueries.getWalletTransactions,
        ],
      });
    },
  });
}

export function usetopUpWallet() {
  const { auth } = useStores();
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.paymentQueries.topUpWallet],
    mutationFn: (amount: number) => topUpWallet(auth.token, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          REACT_QUERY_KEYS.authQueries.getWalletBalance,
          REACT_QUERY_KEYS.authQueries.getWalletTransactions,
        ],
      });
    },
  });
}
