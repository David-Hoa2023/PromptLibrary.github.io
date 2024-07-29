const netlifyIdentity = window.netlifyIdentity;

export const getCurrentUser = () => netlifyIdentity.currentUser();

export const signOut = async () => netlifyIdentity.logout();

export const getData = async () => {
  const user = netlifyIdentity.currentUser();
  if (!user) {
    throw new Error('No user logged in');
  }

  try {
    const token = await user.jwt();
    console.log('Fetching data for user:', user.email);
    console.log('User token:', token.slice(0, 10) + '...');

    const response = await fetch('/.netlify/functions/getData', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseText = await response.text();
    console.log('Response text:', responseText);

    const data = JSON.parse(responseText);
    console.log('getData response:', data);

    return data;
  } catch (error) {
    console.error('Error in getData:', error);
    throw error;
  }
};

export const saveData = async (key, value) => {
  const user = netlifyIdentity.currentUser();
  if (!user) {
    throw new Error('No user logged in');
  }

  try {
    const token = await user.jwt();
    console.log(`Saving data for key: ${key}`, value);
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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseText = await response.text();
    console.log('Response text:', responseText);

    const result = JSON.parse(responseText);
    console.log('saveData response:', result);

    return result;
  } catch (error) {
    console.error('Error in saveData:', error);
    throw error;
  }
};
