// Ensure netlifyIdentity is available
const netlifyIdentity = window.netlifyIdentity;

export const getCurrentUser = () => {
  return netlifyIdentity.currentUser();
};

export const signUp = async () => {
  return new Promise((resolve, reject) => {
    netlifyIdentity.open('signup');
    netlifyIdentity.on('login', user => {
      netlifyIdentity.close();
      resolve(user);
    });
    netlifyIdentity.on('error', err => {
      netlifyIdentity.close();
      reject(err);
    });
  });
};

export const signIn = async () => {
  return new Promise((resolve, reject) => {
    netlifyIdentity.open('login');
    netlifyIdentity.on('login', user => {
      netlifyIdentity.close();
      resolve(user);
    });
    netlifyIdentity.on('error', err => {
      netlifyIdentity.close();
      reject(err);
    });
  });
};

export const signOut = async () => {
  await netlifyIdentity.logout();
};

export const saveData = async (key, value) => {
  const user = getCurrentUser();
  if (!user) throw new Error('No user logged in');
  
  const response = await fetch('/.netlify/functions/saveData', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + user.token.access_token,
    },
    body: JSON.stringify({ key, value }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to save data');
  }
};

export const getAllData = async () => {
  const user = getCurrentUser();
  if (!user) throw new Error('No user logged in');

  const response = await fetch('/.netlify/functions/getAllData', {
    headers: {
      'Authorization': 'Bearer ' + user.token.access_token,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  
  return response.json();
};
