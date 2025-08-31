import client from '../../client/client';

export const signUp = async (values: signupRequest) => {
  try {
    const response = await client.post('/signup', values);
    return response;
  } catch (error) {
    console.error('Error during sign-up:', error);
    throw error;
  }
};

export async function userLogin(values: loginRequest) {
  try {
    const response = await client.post('/login', values);
    return response;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
}

export const forgotPassword = async (values: forgotPasswordRequest) => {
  try {
    const res = await client.post('/forgot-password', values);
    return res.data;
  } catch (error) {
    console.error('Error during forgot password:', error);
    throw error;
  }
};

export const isResetTokenValid = async (values: isResetTokenValidRequest) => {
  try {
    const response = await client.post('/isResetTokenValid', values);
    return response;
  } catch (error) {
    console.error('Error during isResetTokenValid:', error);
    throw error;
  }
};

export const verifyOtp = async (values: verifyOTP) => {
  try {
    const response = await client.post('/verifyOTP', values);
    return response;
  } catch (error) {
    console.error('Error during Verification:', error);
    throw error;
  }
};

export const changePassword = async (values: changePasswordRequest) => {
  try {
    const response = await client.post('/resetPassword', values);
    return response;
  } catch (error) {
    console.error('Error during change password:', error);
    throw error;
  }
};

export const addAddress = async (values: addAddressRequest, token: string) => {
  try {
    const response = await client.post('/addAddress', values, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    console.error(
      'Error during add address:',
      (error as any).response
        ? (error as any).response.data
        : (error as any).message,
    );
    throw error;
  }
};

export const getWalletBalance = async (token: string) => {
  try {
    const response = await client.get('/getUserWallet', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error during get wallet balance:', error);
    throw error;
  }
};

export const getWalletTransactions = async (id: string) => {
  try {
    const response = await client.get(`/getTransactions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error during get transactions:', error);
    throw error;
  }
};
