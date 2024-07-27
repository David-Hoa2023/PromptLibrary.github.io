const netlifyIdentity = window.netlifyIdentity;

export const getCurrentUser = () => {
  return netlifyIdentity.currentUser();
};

export const getAllData = async () => {
  const user = getCurrentUser();
  if (!user) throw new Error('No user logged in');

  try {
    const response = await fetch('/.netlify/functions/getAllData', {
      headers: {
        'Authorization': 'Bearer ' + user.token.access_token,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('getAllData error:', response.status, errorText);
      throw new Error(`Failed to fetch data: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('getAllData response:', data);
    return data;
  } catch (error) {
    console.error('Error in getAllData:', error);
    throw error;
  }
};

export const saveData = async (key, value) => {
  const user = getCurrentUser();
  if (!user) throw new Error('No user logged in');

  try {
    const response = await fetch('/.netlify/functions/saveData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + user.token.access_token,
      },
      body: JSON.stringify({ key, value }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('saveData error:', response.status, errorText);
      throw new Error(`Failed to save data: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('saveData response:', result);
    return result;
  } catch (error) {
    console.error('Error in saveData:', error);
    throw error;
  }
};
