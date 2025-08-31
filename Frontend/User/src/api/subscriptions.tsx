import client from '../../client/client';

export const getSubscriptions = async (token: string) => {
  try {
    const response = await client.get('/getUserSubscriptions', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error during get subscriptions:', error);
    throw error;
  }
};

export const createSubscription = async (
  token: string,
  values: CreateSubscriptionRequest,
) => {
  try {
    const response = await client.post('/createSubscription', values, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error during create subscription:', error);
    throw error;
  }
};

export const updateSubscription = async (
  token: string,
  id: string,
  values: UpdateSubscriptionRequest,
) => {
  try {
    const response = await client.post('/updateSubscription', values, {
      headers: {
        Authorization: `Bearer ${token}`,
        id: id,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error during update subscription:', error);
    throw error;
  }
};

export const cancelSubscription = async (token: string, id: string) => {
  try {
    const response = await client.delete('/cancelSubscription', {
      headers: {
        Authorization: `Bearer ${token}`,
        id: id,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error during cancel subscription:', error);
    throw error;
  }
};
