import React, { useEffect } from 'react';
import PromptLibrary from './PromptLibrary';
import ErrorBoundary from './ErrorBoundary';

function App() {
  useEffect(() => {
    if (window.netlifyIdentity) {
      window.netlifyIdentity.on("init", user => {
        if (!user) {
          window.netlifyIdentity.on("login", () => {
            document.location.href = "/";
          });
        }
      });
    }
  }, []);

  return (
    <ErrorBoundary>
      <div className="App">
        <PromptLibrary />
      </div>
    </ErrorBoundary>
  );
}

export default App;

// function App() {
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Simulate initialization
//     setTimeout(() => {
//       setIsLoading(false);
//     }, 2000);
//   }, []);

//   if (error) {
//     return <div>Error: {error.message}</div>;
//   }

//   if (isLoading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="App">
//       <h1>Prompt Library</h1>
//       <PromptLibrary />
//     </div>
//   );
// }

// export default App;
