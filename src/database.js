const API_URL = '/api';

export const saveData = async (key, value) => {
  const response = await fetch(`${API_URL}/data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ key, value }),
  });
  if (!response.ok) {
    throw new Error('Failed to save data');
  }
};

export const getAllData = async () => {
  const response = await fetch(`${API_URL}/data`);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};

// If you need a getData function for a specific key, you can add it like this:
export const getData = async (key) => {
  const allData = await getAllData();
  return allData[key];
};