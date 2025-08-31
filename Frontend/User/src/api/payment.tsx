import client from '../../client/client';

export const createPaymentIntent = async (
  values: createPaymentIntentRequest,
) => {
  try {
    const response = await client.post('createPaymentIntent', values, {
      headers: {
        Authorization: `Bearer ${values.token}`,
      },
    });
    return response;
  } catch (error) {
    console.error('Error during get products:', error);
    throw error;
  }
};

export const topUpWallet = async (token: string, amount: number) => {
  try {
    const response = await client.post(
      '/topUpWallet',
      { amount },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error('Error during wallet top-up:', error);
    throw error;
  }
};
