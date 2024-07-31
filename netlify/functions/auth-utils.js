// src/utils/auth-utils.js

export const checkIfAdmin = async (user) => {
  try {
    const token = await user.jwt();
    const response = await fetch('/.netlify/functions/getUserRole', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { role } = await response.json();
    return role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// You can add other authentication-related utility functions here
