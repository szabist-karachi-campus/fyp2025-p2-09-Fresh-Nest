import client from '../../client/client';

export const getProducts = async () => {
  try {
    const response = await client.get('/getProducts');
    return response.data.products;
  } catch (error) {
    console.error('Error during get products:', error);
    throw error;
  }
};
