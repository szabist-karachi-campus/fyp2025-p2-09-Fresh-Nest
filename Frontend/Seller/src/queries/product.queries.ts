import { useMutation, useQuery } from '@tanstack/react-query';

import { useStores } from '@/stores';

import {
  createProduct,
  deleteProduct,
  editProduct,
  getProduct,
  getProducts,
  uploadProductImages,
} from '../api/product';
import { REACT_QUERY_KEYS } from './index';

export function useGetProducts() {
  const { auth } = useStores();
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.productQueries.getProducts],
    queryFn: () => getProducts(auth.token),
  });
}

export function useCreateProduct() {
  const { auth } = useStores();

  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.productQueries.createProduct],
    mutationFn: (values: Product) => createProduct(auth.token, values),
  });
}

export function useUploadProductImages() {
  const { auth } = useStores();

  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.productQueries.uploadProductImages],
    mutationFn: (values: addImageRequest) =>
      uploadProductImages(auth.token, values.productId, values.images),
  });
}

export function useDeleteProduct() {
  const { auth } = useStores();
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.productQueries.deleteProduct],
    mutationFn: (productId: string) => deleteProduct(auth.token, productId),
  });
}

export function useUpdateProduct() {
  const { auth } = useStores();

  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.productQueries.updateProduct],
    mutationFn: ({
      values,
      productId,
    }: {
      values: UpdateProductRequest;
      productId: string;
    }) => {
      if (!auth.token) {
        throw new Error('User is not authenticated');
      }
      return editProduct(auth.token, productId, values);
    },
  });
}

export function useGetProduct(productId: string) {
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.productQueries.getProducts],
    queryFn: () => getProduct(productId),
  });
}
