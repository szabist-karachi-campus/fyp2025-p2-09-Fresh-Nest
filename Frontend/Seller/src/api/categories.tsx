import client from '../../client/client';

export const getCategories = async () => {
  try {
    const response = await client.get('/getCategories');
    return response.data;
  } catch (error) {
    console.error('Error during get categories:', error);
    throw error;
  }
};
