import client from '../../client/client';

export const getWalletTransactions = async (id: string) => {
  try {
    const response = await client.get(`/getTransactions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error during get transactions:', error);
    throw error;
  }
};

export const connectStripe = async (token: string) => {
  try {
    const response = await client.post(
      '/connectStripe',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error('Error during Stripe connect:', error);
    throw error;
  }
};

export const withdrawVendorMoney = async (token: string) => {
  try {
    const response = await client.post(
      '/withdrawMoney',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error('Error during vendor withdrawal:', error);
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
