import client from '../../client/client';

export const getAds = async () => {
  try {
    const response = await client.get('/getAds');
    return response.data;
  } catch (error) {
    console.error('Error fetching ads:', error);
    throw error;
  }
};

export const getBidRange = async () => {
  try {
    const response = await client.get('/getBidRange');
    return response.data;
  } catch (error) {
    console.error('Error fetching bid range:', error);
    throw error;
  }
};

export const createAd = async (token: string, adData: any) => {
  try {
    const response = await client.post('/createAd', adData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating ad:', error);
    throw error;
  }
};

export const updateAd = async (token: string, id: string, adData: any) => {
  try {
    const response = await client.put(`/updateAd/${id}`, adData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log('DATA', id);
    console.error('Error updating ad:', error);
    throw error;
  }
};

export const getAdPerformance = async (token: string, adId: string) => {
  try {
    const response = await client.get(`/getAdPerformance/${adId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching ad performance:', error);
    throw error;
  }
};

export const getAdByProduct = async (productId: string) => {
  try {
    const response = await client.get(`/getAdByProduct/${productId}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return {
        success: false,
        message: 'No ad found',
        ad: null,
      };
    }
    console.error('Error fetching ad by product:', error);
    throw error;
  }
};
