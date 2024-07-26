const API_URL = '/.netlify/functions';

export const saveData = async (key, value) => {
  try {
    const response = await fetch(`${API_URL}/saveData`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key, value }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error in saveData:', error);
    throw error;
  }
};

export const getAllData = async () => {
  try {
    const response = await fetch(`${API_URL}/getData`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error in getAllData:', error);
    throw error;
  }
};
