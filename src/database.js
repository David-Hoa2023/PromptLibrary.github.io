const netlifyIdentity = window.netlifyIdentity;

export const getCurrentUser = () => {
  return netlifyIdentity.currentUser();
};

export const signUp = async (email, password) => {
  try {
    await netlifyIdentity.signup({ email, password });
  } catch (error) {
    console.error('Sign up error:', error);
    throw new Error(error.message || 'Failed to sign up');
  }
};

export const signIn = async (email, password) => {
  try {
    await netlifyIdentity.login({ email, password });
  } catch (error) {
    console.error('Sign in error:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
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
