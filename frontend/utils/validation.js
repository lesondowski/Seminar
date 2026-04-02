// Validate email format
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Validate password
export const validatePassword = (password) => {
  return password.length >= 6;
};

// Validate POI data
export const validatePOI = (poi) => {
  const errors = {};

  if (!poi.name || poi.name.trim() === '') {
    errors.name = 'Tên quán không được để trống';
  }

  if (!poi.description || poi.description.trim() === '') {
    errors.description = 'Mô tả không được để trống';
  }

  if (!poi.price || isNaN(poi.price)) {
    errors.price = 'Giá phải là số hợp lệ';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};
