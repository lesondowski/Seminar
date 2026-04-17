import { apiRequest } from '../api/client';

const ACCESS_TOKEN_KEY = 'accessToken';

export const getAccessToken = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(ACCESS_TOKEN_KEY) || '';
};

export const storeAccessToken = (token) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const loginUser = async (email, language, otpVerified = true) => {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: {
      email,
      language,
      otp_verified: otpVerified,
    },
  });

  if (data?.access_token) {
    storeAccessToken(data.access_token);
  }

  return data;
};

export const getUserProfile = async () => {
  return apiRequest('/auth/profile', {
    token: getAccessToken(),
  });
};

export const logoutUser = async () => {
  const token = getAccessToken();
  try {
    await apiRequest('/auth/logout', {
      method: 'POST',
      token,
    });
  } catch (error) {
    // Keep client-side sign-out resilient if server session is already gone.
  }

  if (typeof window !== 'undefined') {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userLanguage');
    localStorage.removeItem('userRole');
  }
};


export const adminCreateOrUpdateUser = async ({ email, language = 'vi', role = 'owner' }) => {
  return apiRequest('/auth/admin/users', {
    method: 'POST',
    token: getAccessToken(),
    body: { email, language, role },
  });
};


export const adminListUsers = async () => {
  return apiRequest('/auth/admin/users', {
    method: 'GET',
    token: getAccessToken(),
  });
};
