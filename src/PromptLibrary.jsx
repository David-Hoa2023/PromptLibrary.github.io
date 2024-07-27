import React, { useState, useEffect } from 'react';
import { getCurrentUser, signOut, getData } from './database';

const PromptLibrary = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const netlifyIdentity = window.netlifyIdentity;
    netlifyIdentity.on('init', user => {
      console.log('Netlify Identity initialized');
      setUser(user);
      setIsLoading(false);
    });
    netlifyIdentity.on('login', user => {
      console.log('User logged in:', user);
      setUser(user);
      setIsLoading(false);
    });
    netlifyIdentity.on('logout', () => {
      console.log('User logged out');
      setUser(null);
      setIsLoading(false);
    });
    netlifyIdentity.init();

    return () => {
      netlifyIdentity.off('init');
      netlifyIdentity.off('login');
      netlifyIdentity.off('logout');
    };
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {user ? (
        <div>
          <h1>Welcome, {user.email}</h1>
          <button onClick={() => signOut()}>Sign Out</button>
        </div>
      ) : (
        <div>
          <h1>Please sign in</h1>
          <button onClick={() => window.netlifyIdentity.open()}>Sign In</button>
        </div>
      )}
    </div>
  );
};

export default PromptLibrary;
