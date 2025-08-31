import { useMutation, useQuery } from '@tanstack/react-query';

import { queryClient } from '@/App';
import { useStores } from '@/stores';

import {
  changePassword,
  forgotPassword,
  getCert,
  getWalletBalance,
  isResetTokenValid,
  Login,
  signUp,
  uploadCert,
  verifyOtp,
} from '../api/auth';
import { REACT_QUERY_KEYS } from './index';

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
    mutationFn: (values: loginRequest) => Login(values),
    onSuccess: (data) => {
      auth.set('token', data.data.token);
      auth.set('expiresAt', data.data.expiresAt);
    },
  });
}
export function useUploadCertification() {
  const { auth } = useStores();
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.authQueries.uploadCert],
    mutationFn: (image: any) => uploadCert(auth.token, image),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.authQueries.getCert],
      });
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

export function useGetWalletBalance(invalidate: boolean = false) {
  const { auth } = useStores();
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.authQueries.getWalletBalance],
    queryFn: () => getWalletBalance(auth.token, invalidate),
  });
}
export function useGetCert() {
  const { auth } = useStores();
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.authQueries.getCert],
    queryFn: () => getCert(auth.token),
  });
}
