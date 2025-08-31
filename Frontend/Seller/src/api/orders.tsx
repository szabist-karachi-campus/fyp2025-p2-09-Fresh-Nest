import client from '../../client/client';

export const getOrders = async (token: string) => {
  try {
    const response = await client.get('/getVendorOrders', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error during get orders:', error);
    throw error;
  }
};

export const updateOrderStatus = async (status: string, orderId: string) => {
  try {
    const response = await client.post(`/updateOrderStatus/${orderId}`, {
      status,
    });
    return response.data;
  } catch (error) {
    console.error(
      'Error while updating Order Status:',
      (error as any).response
        ? (error as any).response.data
        : (error as any).message,
    );
    throw error;
  }
};

export const cancelOrder = async (orderNo: string) => {
  try {
    const response = await client.post(`/cancelOrder`, orderNo);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(
      'Error while cancelling Order:',
      (error as any).response
        ? (error as any).response.data
        : (error as any).message,
    );
    throw error;
  }
};

export const getVendorSales = async (token: string) => {
  try {
    const response = await client.get('/getVendorSales', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error while fetching vendor sales:', error);
    throw error;
  }
};
