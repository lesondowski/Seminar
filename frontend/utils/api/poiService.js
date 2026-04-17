import { apiRequest, API_BASE_URL } from './client';
import { getAccessToken } from '../auth/authService';

const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

// Get all POIs
export const fetchPOIs = async () => {
  try {
    return await apiRequest('/pois', {
      token: getAccessToken(),
    });
  } catch (error) {
    console.error('Error fetching POIs:', error);
    return [];
  }
};

// Get POI by ID
export const fetchPOIById = async (id) => {
  try {
    return await apiRequest(`/pois/${id}`, {
      token: getAccessToken(),
    });
  } catch (error) {
    console.error('Error fetching POI:', error);
    return null;
  }
};

// Create POI
export const createPOI = async (poiData) => {
  try {
    return await apiRequest('/pois', {
      method: 'POST',
      token: getAccessToken(),
      body: poiData,
    });
  } catch (error) {
    console.error('Error creating POI:', error);
    throw error;
  }
};

// Update POI
export const updatePOI = async (id, poiData) => {
  try {
    return await apiRequest(`/pois/${id}`, {
      method: 'PUT',
      token: getAccessToken(),
      body: poiData,
    });
  } catch (error) {
    console.error('Error updating POI:', error);
    throw error;
  }
};

// Delete POI
export const deletePOI = async (id) => {
  try {
    return await apiRequest(`/pois/${id}`, {
      method: 'DELETE',
      token: getAccessToken(),
    });
  } catch (error) {
    console.error('Error deleting POI:', error);
    throw error;
  }
};

// Approve POI (admin/moderator only)
export const approvePOI = async (id) => {
  try {
    return await apiRequest(`/pois/${id}/approve`, {
      method: 'POST',
      token: getAccessToken(),
    });
  } catch (error) {
    console.error('Error approving POI:', error);
    throw error;
  }
};

// Reject POI (admin/moderator only)
export const rejectPOI = async (id, rejectReason) => {
  try {
    return await apiRequest(`/pois/${id}/reject`, {
      method: 'POST',
      token: getAccessToken(),
      body: { rejectReason },
    });
  } catch (error) {
    console.error('Error rejecting POI:', error);
    throw error;
  }
};

// Get tours
export const fetchTours = async () => {
  try {
    return await apiRequest('/tours', {
      token: getAccessToken(),
    });
  } catch (error) {
    console.error('Error fetching tours:', error);
    return [];
  }
};

// Create tour (admin/moderator only)
export const createTour = async (tourData) => {
  try {
    return await apiRequest('/tours', {
      method: 'POST',
      token: getAccessToken(),
      body: tourData,
    });
  } catch (error) {
    console.error('Error creating tour:', error);
    throw error;
  }
};

// Update tour (admin/moderator only)
export const updateTour = async (id, tourData) => {
  try {
    return await apiRequest(`/tours/${id}`, {
      method: 'PUT',
      token: getAccessToken(),
      body: tourData,
    });
  } catch (error) {
    console.error('Error updating tour:', error);
    throw error;
  }
};

// Delete tour (admin/moderator only)
export const deleteTour = async (id) => {
  try {
    return await apiRequest(`/tours/${id}`, {
      method: 'DELETE',
      token: getAccessToken(),
    });
  } catch (error) {
    console.error('Error deleting tour:', error);
    throw error;
  }
};


// Geocode address suggestions for admin/moderator POI form
export const searchAddressSuggestions = async (query, limit = 5) => {
  try {
    return await apiRequest(`/pois/geocode/search?query=${encodeURIComponent(query)}&limit=${limit}`, {
      token: getAccessToken(),
    });
  } catch (error) {
    console.error('Error searching addresses:', error);
    return [];
  }
};


// Reverse geocode map pin to readable address
export const reverseGeocodeLocation = async (lat, lng) => {
  try {
    return await apiRequest(`/pois/geocode/reverse?lat=${lat}&lng=${lng}`, {
      token: getAccessToken(),
    });
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return { display_name: '' };
  }
};


// Upload an image file and return absolute URL for rendering in frontend.
export const uploadPOIImage = async (file) => {
  if (!file) throw new Error('Không có file để upload');

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/uploads`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.detail || payload?.message || 'Upload thất bại');
  }

  const uploadedUrl = payload?.url || '';
  if (!uploadedUrl) {
    throw new Error('Server không trả về URL ảnh');
  }

  return uploadedUrl.startsWith('http') ? uploadedUrl : `${BACKEND_ORIGIN}${uploadedUrl}`;
};
