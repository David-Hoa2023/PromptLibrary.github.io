import React, { useState, useEffect } from 'react';
import PromptLibrary from './PromptLibrary';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate initialization
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <h1>Prompt Library</h1>
      <PromptLibrary />
    </div>
  );
}

export default App;
