// Login user
export const loginUser = async (email, language) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, language }),
    });

    if (!response.ok) {
      throw new Error('Đăng nhập thất bại');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await fetch('/api/auth/profile');

    if (!response.ok) {
      throw new Error('Không thể lấy thông tin profile');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Logout user
export const logoutUser = async () => {
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userLanguage');
  localStorage.removeItem('userRole');
};
