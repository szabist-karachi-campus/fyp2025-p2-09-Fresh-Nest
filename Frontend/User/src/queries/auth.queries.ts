import { useMutation, useQuery } from '@tanstack/react-query';
import { REACT_QUERY_KEYS } from './index';
import {
  userLogin,
  signUp,
  forgotPassword,
  isResetTokenValid,
  verifyOtp,
  changePassword,
  addAddress,
  getWalletBalance,
  getWalletTransactions,
  // editUserProfile,
} from '../api/auth';
import { useStores } from '@/stores';

class CustomError extends Error {
  constructor(message: string, name: string, stack?: string) {
    super(message);
    this.name = name;
    if (stack) {
      this.stack = stack;
    }
  }
}

export function useUserLogin() {
  const { auth } = useStores();
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.authQueries.userLogin],
    mutationFn: (values: loginRequest) => userLogin(values),
    onSuccess: (data) => {
      auth.set('token', data.data.token);
      auth.set('expiresAt', data.data.expiresAt);
    },
  });
}

export function useUserSignup() {
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.authQueries.userSignup],
    mutationFn: (values: signupRequest) => signUp(values),
    onError: (error: any) => {
      const formattedError = new CustomError(
        error?.response?.data?.message || 'An unknown error occurred',
        error.message,
        error.stack,
      );
      throw formattedError;
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.authQueries.forgotPassword],
    mutationFn: (values: forgotPasswordRequest) => forgotPassword(values),
  });
}

export function useIsResetTokenValid() {
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.authQueries.isResetTokenValid],
    mutationFn: (values: isResetTokenValidRequest) => isResetTokenValid(values),
  });
}

export function useVerifyOTP() {
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.authQueries.verifyOTP],
    mutationFn: (values: verifyOTP) => verifyOtp(values),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.authQueries.changePassword],
    mutationFn: (values: changePasswordRequest) => changePassword(values),
  });
}

export function useAddAddress() {
  const { auth } = useStores();
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.authQueries.addAddress],
    mutationFn: (values: addAddressRequest) => addAddress(values, auth.token),
  });
}

export function useGetWalletBalance() {
  const { auth } = useStores();
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.authQueries.getWalletBalance],
    queryFn: () => getWalletBalance(auth.token),
  });
}

export function useGetWalletTransactions(id: string) {
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.authQueries.getWalletTransactions, id],
    queryFn: () => getWalletTransactions(id),
  });
}
