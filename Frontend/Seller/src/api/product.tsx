import client from '../../client/client';

export const getProducts = async (token: string) => {
  try {
    const response = await client.get('/getVendorProducts', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error during get product:', error);
    throw error;
  }
};

export const createProduct = async (token: string, product: Product) => {
  try {
    const response = await client.post('/createProduct', product, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error during create product:', error);
    throw error;
  }
};

export const uploadProductImages = async (
  token: string,
  productId: string,
  images: any[],
) => {
  const formData = new FormData();

  images.forEach((image, index) => {
    formData.append('product', {
      uri: image.uri,
      name: `image_${index}.jpg`,
      type: image.type,
    });
  });

  try {
    const response = await client.post(
      `/uploadProductImage/${productId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      'Error uploading images:',
      error.response?.data || error.message,
    );
    throw new Error(error.response?.data?.message || 'Failed to upload images');
  }
};

export const deleteProduct = async (token: string, productId: string) => {
  try {
    console.log('Token:', token); 
    const response = await client.delete(`/deleteProduct/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error during delete product:', error || error);
    throw error;
  }
};

export const editProduct = async (
  token: string,
  productId: string,
  productData: {
    name?: string;
    price?: number;
    description?: string;
    category?: string;
  },
) => {
  try {
    console.log('Token:', token);
    console.log('Product Data:', productData); 

    const response = await client.post(
      `/editProduct/${productId}`,
      productData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      'Error during edit product:',
      error.response?.data || error.message,
    );
    throw error.response?.data || error;
  }
};

export const getProduct = async (productId: string) => {
  try {
    const response = await client.get(`/getProduct/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error during get product:', error);
    throw error;
  }
};
