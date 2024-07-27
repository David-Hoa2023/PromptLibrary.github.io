const netlifyIdentity = window.netlifyIdentity;

export const getCurrentUser = () => {
  return netlifyIdentity.currentUser();
};

export const signOut = async () => {
  await netlifyIdentity.logout();
};

export const getData = async () => {
  const user = getCurrentUser();
  if (!user) throw new Error('No user logged in');

  try {
    console.log('Fetching data for user:', user.email);
    const response = await fetch('/.netlify/functions/getData', {
      headers: {
        'Authorization': 'Bearer ' + user.token.access_token,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('getData error:', response.status, errorText);
      throw new Error(`Failed to fetch data: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('getData response:', data);
    return data;
  } catch (error) {
    console.error('Error in getData:', error);
    throw error;
  }
};

export const saveData = async (key, value) => {
  const user = getCurrentUser();
  if (!user) throw new Error('No user logged in');

  try {
    console.log(`Saving data for key: ${key}`, value);
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
