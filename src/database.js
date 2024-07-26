const API_URL = '/.netlify/functions';

export const saveData = async (key, value) => {
  const response = await fetch(`${API_URL}/saveData`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ key, value }),
  });
  if (!response.ok) {
    throw new Error('Failed to save data');
  }
  return response.json();
};

export const getAllData = async () => {
  const response = await fetch(`${API_URL}/getData`);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};

export const getData = async (key) => {
  const allData = await getAllData();
  return allData[key];
};
