// App.js
import React, { useEffect } from 'react';
import { init } from './distcopy/index.browser';

function App() {
  useEffect(() => {
    // Use the function
    (async () => {
      const { makeDid } = await init();
    
      // Use the function
      console.log(makeDid())
    })();
  }, []);

  return (
    <div className="App">
      <h1>Web 5.1</h1>
    </div>
  );
}

export default App;