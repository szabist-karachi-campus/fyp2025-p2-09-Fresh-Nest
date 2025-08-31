import client from '../../client/client';

export const getThreadByOrderId = async (
  orderId: string,
  token: string,
  context: string,
) => {
  try {
    const response = await client.post(
      `/thread/${orderId}?with=${context}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching thread by order ID:', error);
    throw error;
  }
};

export const getAllThreads = async (token: string) => {
  try {
    const response = await client.get('/getThread', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all threads:');
    throw error;
  }
};

export const getThreadById = async (id: string) => {
  try {
    const response = await client.get(`/getThreadById/${id}`, {});
    return response.data;
  } catch (error) {
    console.error('Error fetching thread by ID:', error);
    throw error;
  }
};

export const sendMessage = async (
  token: string,
  values: sendMessageRequest,
) => {
  try {
    const response = await client.post(`/sendMessage`, values, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:');
    throw error;
  }
};
