import { useMutation, useQuery } from '@tanstack/react-query';

import { queryClient } from '@/App';
import { useStores } from '@/stores';

import {
  deleteUser,
  deleteVendor,
  getDeletedUsers,
  getDeletedVendors,
  getUserById,
  getUserList,
  getVendorById,
  getvendorWaitingList,
  getVerifiedVendors,
  handleVendorStatus,
} from '../api/super';
import { REACT_QUERY_KEYS } from './index';

export const useGetVerifiedVendors = () => {
  const { auth } = useStores();
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.superQueries.getVerifiedVendors],
    queryFn: () => getVerifiedVendors(auth.token),
  });
};

export const useGetVendorWaitingList = () => {
  const { auth } = useStores();
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.superQueries.getVendorRequests],
    queryFn: () => getvendorWaitingList(auth.token),
  });
};

export const useGetVendorById = (id: string) => {
  const { auth } = useStores();
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.superQueries.getVendorById, id],
    queryFn: () => getVendorById(auth.token, id),
  });
};

export const useHandleVendorStatus = () => {
  const { auth } = useStores();
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.superQueries.approveVendorRequest],
    mutationFn: (data: { email: string; status: string }) =>
      handleVendorStatus(auth.token, data.email, data.status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.superQueries.getVendorRequests],
      });
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.superQueries.getVerifiedVendors],
      });
    },
  });
};

export const useDeleteVendor = () => {
  const { auth } = useStores();
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.superQueries.deleteVendor],
    mutationFn: (vendorId: string) => deleteVendor(auth.token, vendorId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.superQueries.getVerifiedVendors],
      });
    },
  });
};

export const useGetUserList = () => {
  const { auth } = useStores();
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.superQueries.getUserList],
    queryFn: () => getUserList(auth.token),
  });
};

export const useGetUserById = (id: string) => {
  const { auth } = useStores();
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.superQueries.getUserById, id],
    queryFn: () => getUserById(auth.token, id),
  });
};

export const useDeleteUser = () => {
  const { auth } = useStores();
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.superQueries.deleteUser],
    mutationFn: (userId: string) => deleteUser(auth.token, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.superQueries.getUserList],
      });
    },
  });
};

export const useGetDeletedUsers = () => {
  const { auth } = useStores();
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.superQueries.getDeletedUsers],
    queryFn: () => getDeletedUsers(auth.token),
  });
};

export const useGetDeletedVendors = () => {
  const { auth } = useStores();
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.superQueries.getDeletedVendors],
    queryFn: () => getDeletedVendors(auth.token),
  });
};
