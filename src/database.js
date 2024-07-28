const netlifyIdentity = window.netlifyIdentity;

export const getCurrentUser = () => {
  return netlifyIdentity.currentUser();
};

export const signOut = async () => {
  await netlifyIdentity.logout();
};

export const getData = async () => {
  return new Promise((resolve, reject) => {
    const user = netlifyIdentity.currentUser();
    if (!user) {
      reject(new Error('No user logged in'));
      return;
    }

    user.jwt().then(token => {
      console.log('Fetching data for user:', user.email);
      console.log('User token:', token.slice(0, 10) + '...');

      fetch('/.netlify/functions/getData', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      .then(response => {
        console.log('Response status:', response.status);
        return response.text();
      })
      .then(responseText => {
        console.log('Response text:', responseText);
        const data = JSON.parse(responseText);
        console.log('getData response:', data);
        resolve(data);
      })
      .catch(error => {
        console.error('Error in getData:', error);
        reject(error);
      });
    }).catch(error => {
      console.error('Error getting JWT:', error);
      reject(error);
    });
  });
};

export const saveData = async (key, value) => {
  return new Promise((resolve, reject) => {
    const user = netlifyIdentity.currentUser();
    if (!user) {
      reject(new Error('No user logged in'));
      return;
    }

    user.jwt().then(token => {
      console.log(`Saving data for key: ${key}`, value);
      console.log('User token:', token.slice(0, 10) + '...');

      fetch('/.netlify/functions/saveData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ key, value }),
      })
      .then(response => {
        console.log('Response status:', response.status);
        return response.text();
      })
      .then(responseText => {
        console.log('Response text:', responseText);
        const result = JSON.parse(responseText);
        console.log('saveData response:', result);
        resolve(result);
      })
      .catch(error => {
        console.error('Error in saveData:', error);
        reject(error);
      });
    }).catch(error => {
      console.error('Error getting JWT:', error);
      reject(error);
    });
  });
};
