import client from '../../client/client';

export const getVerifiedVendors = async (token: string) => {
  try {
    const response = await client.get('/getVendorsSuperAdmin', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching verified vendors:', error);
    throw error;
  }
};

export const getvendorWaitingList = async (token: string) => {
  try {
    const response = await client.get('/vendorWaitingList', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching unverified vendors:', error);
    throw error;
  }
};

export const handleVendorStatus = async (
  token: string,
  email: string,
  status: string,
) => {
  try {
    const response = await client.post(
      '/handleVendorStatus',
      { email, status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error('Error handling vendor status:', error);
    throw error;
  }
};

export const getVendorById = async (token: string, id: string) => {
  try {
    const response = await client.get(`/getVendorById/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching vendor by ID:', error);
    throw error;
  }
};

export const deleteVendor = async (token: string, vendorId: string) => {
  try {
    const response = await client.post(
      `/deleteVendor`,
      { id: vendorId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting vendor:', error);
    throw error;
  }
};

export const getUserList = async (token: string) => {
  try {
    const response = await client.get('/getAllUsers', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user list:', error);
    throw error;
  }
};

export const getUserById = async (token: string, id: string) => {
  try {
    const response = await client.get(`/getUserById/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};

export const deleteUser = async (token: string, userId: string) => {
  try {
    const response = await client.post(
      `/deleteUser`,
      { id: userId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const getDeletedUsers = async (token: string) => {
  try {
    const response = await client.get('/getDeletedUsers', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching deleted users:', error);
    throw error;
  }
};

export const getDeletedVendors = async (token: string) => {
  try {
    const response = await client.get('/getDeletedVendors', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching deleted vendors:', error);
    throw error;
  }
};
