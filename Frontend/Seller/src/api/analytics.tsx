import client from '../../client/client';

export const getVendorRevenue = async (token: string) => {
  try {
    const response = await client.get('/getVendorRevenue', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching vendor revenue:', error);
    throw error;
  }
};

export const getOrderAnalytics = async (token: string) => {
  try {
    const response = await client.get('/getOrderAnalytics', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching order analytics:', error);
    throw error;
  }
};

export const getBestseller = async (token: string) => {
  try {
    const response = await client.get('/getBestseller', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching bestseller data:', error);
    throw error;
  }
};

export const getAdAnalytics = async (token: string) => {
  try {
    const response = await client.get('/getAdAnalytics', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching ad analytics:', error);
    throw error;
  }
};

export const getSubscriptionAnalytics = async (token: string) => {
  try {
    const response = await client.get('/getSubscriptionAnalytics', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription analytics:', error);
    throw error;
  }
};

export const getMonthlySalesAnalytics = async (token: string) => {
  try {
    const response = await client.get('/getMonthlySalesAnalytics', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly sales analytics:', error);
    throw error;
  }
};
