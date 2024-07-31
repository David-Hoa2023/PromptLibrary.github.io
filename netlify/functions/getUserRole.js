const checkIfAdmin = async (user) => {
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

    const data = await response.json();
    console.log('getUserRole response:', data);

    if (data.error) {
      throw new Error(data.error);
    }

    return data.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};
