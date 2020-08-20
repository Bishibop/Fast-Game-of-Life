import React from 'react';
import ScriptTag from 'react-script-tag';
import './App.css';

import Sketch from './components/Sketch';


function App() {
  return (
    <div className="App">
      <ScriptTag type="text/javascript" src="https://cdn.jsdelivr.net/npm/p5@1.1.9/lib/p5.js" />
      <Sketch/>
    </div>
  );
}

export default App;
