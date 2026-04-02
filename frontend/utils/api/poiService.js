// Get all POIs
export const fetchPOIs = async () => {
  try {
    const response = await fetch('/api/pois');
    if (!response.ok) throw new Error('Không thể tải POI');
    return await response.json();
  } catch (error) {
    console.error('Error fetching POIs:', error);
    return [];
  }
};

// Get POI by ID
export const fetchPOIById = async (id) => {
  try {
    const response = await fetch(`/api/pois/${id}`);
    if (!response.ok) throw new Error('Không thể tải POI');
    return await response.json();
  } catch (error) {
    console.error('Error fetching POI:', error);
    return null;
  }
};

// Create POI
export const createPOI = async (poiData) => {
  try {
    const response = await fetch('/api/pois', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(poiData),
    });
    if (!response.ok) throw new Error('Không thể tạo POI');
    return await response.json();
  } catch (error) {
    console.error('Error creating POI:', error);
    throw error;
  }
};

// Update POI
export const updatePOI = async (id, poiData) => {
  try {
    const response = await fetch(`/api/pois/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(poiData),
    });
    if (!response.ok) throw new Error('Không thể cập nhật POI');
    return await response.json();
  } catch (error) {
    console.error('Error updating POI:', error);
    throw error;
  }
};

// Delete POI
export const deletePOI = async (id) => {
  try {
    const response = await fetch(`/api/pois/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Không thể xóa POI');
    return await response.json();
  } catch (error) {
    console.error('Error deleting POI:', error);
    throw error;
  }
};

// Get tours
export const fetchTours = async () => {
  try {
    const response = await fetch('/api/tours');
    if (!response.ok) throw new Error('Không thể tải tour');
    return await response.json();
  } catch (error) {
    console.error('Error fetching tours:', error);
    return [];
  }
};
