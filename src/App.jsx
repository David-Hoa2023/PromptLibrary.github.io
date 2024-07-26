import React, { useState, useEffect } from 'react';
import PromptLibrary from './PromptLibrary';
import { getAllData } from './database';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      await getAllData(); // This ensures the database is initialized
      setIsLoading(false);
    };
    loadInitialData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <PromptLibrary />
    </div>
  );
}

export default App;