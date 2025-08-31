import { useMutation, useQuery } from '@tanstack/react-query';

import {
  connectStripe,
  getWalletTransactions,
  topUpWallet,
  withdrawVendorMoney,
} from '@/api/wallet';
import { queryClient } from '@/App';
import { useStores } from '@/stores';

import { REACT_QUERY_KEYS } from '.';

export function useGetWalletTransactions(id: string) {
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.walletQueries.getWalletTransactions, id],
    queryFn: () => getWalletTransactions(id),
  });
}

export function useConnectStripe() {
  const { auth } = useStores();
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.walletQueries.connectStripe],
    mutationFn: () => connectStripe(auth.token),
  });
}

export function useWithdrawVendorMoney() {
  const { auth } = useStores();
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.walletQueries.withdrawVendorMoney],
    mutationFn: () => withdrawVendorMoney(auth.token),
  });
}

export function usetopUpWallet() {
  const { auth } = useStores();
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.walletQueries.topUpWallet],
    mutationFn: (amount: number) => topUpWallet(auth.token, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.authQueries.getWalletBalance],
      });
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.walletQueries.getWalletTransactions],
      });
    },
  });
}
