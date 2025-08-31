import client from '../../client/client';

export const createOrders = async (
  values: createOrderRequest,
  token: string,
) => {
  try {
    const response = await client.post('createOrder', values, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    console.error(
      'Error while creating Order:',
      (error as any).response
        ? (error as any).response.data
        : (error as any).message,
    );
    throw error;
  }
};

export const getOrders = async (token: string) => {
  try {
    const response = await client.get('getUserOrder', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      'Error while creating Order:',
      (error as any).response
        ? (error as any).response.data
        : (error as any).message,
    );
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

export const cancelOrderById = async (id: string) => {
  try {
    const response = await client.post(`/cancelOrderById`, { id });
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
