import { queryClient } from '@/App';
import { REACT_QUERY_KEYS } from '@/queries';

import client from '../../client/client';

export const signUp = async (values: signupRequest) => {
  try {
    const response = await client.post('/vendorSignup', values);
    return response;
  } catch (error) {
    console.error('Error during sign-up:', error);
    throw error;
  }
};

export async function Login(values: loginRequest) {
  try {
    const response = await client.post('/vendorLogin', values);
    return response;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
}

export const forgotPassword = async (values: forgotPasswordRequest) => {
  try {
    const res = await client.post('/vendorForgotPassword', values);
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
    const response = await client.post('/vendorVerify', values);
    return response;
  } catch (error) {
    console.error('Error during Verification:', error);
    throw error;
  }
};

export const changePassword = async (values: changePasswordRequest) => {
  try {
    const response = await client.post('/vendorResetPassword', values);
    return response;
  } catch (error) {
    console.error('Error during change password:', error);
    throw error;
  }
};

export const getWalletBalance = async (
  token: string,
  invalidate: boolean = false,
) => {
  try {
    const response = await client.get('/getVendorWallet', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (invalidate) {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.authQueries.getWalletBalance],
      });
    }

    return response.data;
  } catch (error) {
    console.error('Error during get wallet balance:', error);
    throw error;
  }
};

export const uploadCert = async (token: string, image: any) => {
  const formData = new FormData();
  formData.append('certification', {
    uri: image.uri,
    name: image.fileName || 'cert.jpg',
    type: image.type || 'image/jpeg',
  });

  console.log('Running', formData);
  try {
    const response = await client.post(`/uploadCirtificate`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      'Error uploading images:',
      error.response?.data || error.message,
    );
    throw new Error(error.response?.data?.message || 'Failed to upload images');
  }
};

export const getCert = async (token: string) => {
  try {
    const response = await client.get('/getCertificate', {
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
