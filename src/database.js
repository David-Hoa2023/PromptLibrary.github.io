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
  const user = netlifyIdentity.currentUser();
  if (!user) throw new Error('No user logged in');

  try {
    console.log(`Saving data for key: ${key}`, value);
    const token = user.token.access_token;
    console.log('User token:', token.slice(0, 10) + '...');

    const response = await fetch('/.netlify/functions/saveData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ key, value }),
    });

    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response text:', responseText);

    if (!response.ok) {
      throw new Error(`Failed to save data: ${response.status} ${responseText}`);
    }

    const result = JSON.parse(responseText);
    console.log('saveData response:', result);
    return result;
  } catch (error) {
    console.error('Error in saveData:', error);
    throw error;
  }
};
