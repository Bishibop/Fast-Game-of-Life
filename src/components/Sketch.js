import React, { useEffect } from 'react';
import gol from '../gol'

function Sketch() {

  useEffect(() => {
    new window.p5(gol, "sketch");
  }, []);

  return (
    <div id="sketch">
    </div>
  );
}

export default Sketch;
