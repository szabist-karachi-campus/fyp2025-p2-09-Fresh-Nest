import client from '../../client/client';

export const getAds = async () => {
  try {
    const response = await client.get('/getAds');
    return response.data.ads;
  } catch (error) {
    console.error('Error during get ads:', error);
    throw error;
  }
};

export const countClick = async (id: string, token: string) => {
  try {
    const response = await client.post(
      '/clickCount',
      { id },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    console.error('Error during counting click:', error?.response?.data);
    throw new Error(
      `Failed to count click for adId: ${id}. ${
        error?.response?.data?.message || 'An unexpected error occurred.'
      }`,
    );
  }
};

export const countView = async (id: string) => {
  try {
    const response = await client.post('/viewCount', { id });
    return response.data;
  } catch (error: any) {
    console.error('Error during counting view:', error?.response?.data);
    throw new Error(
      `Failed to count view for adId: ${id}. ${
        error?.response?.data?.message || 'An unexpected error occurred.'
      }`,
    );
  }
};
