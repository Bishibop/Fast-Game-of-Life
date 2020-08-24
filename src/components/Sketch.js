import React, { useState, useEffect } from 'react';
import { gol, toggleGame, clearGame } from '../gol'
import {Slider, Typography} from '@material-ui/core'

function Sketch() {

  let [squares, setSquares] = useState(25);
  let [pixelWidth, setPixelWidth] = useState(600);
  let [iterationInterval, setIterationInterval] = useState(100);
  let [gameRunning, setGameRunning] = useState(false);
  let [sketchOptions, setSketchOptions] = useState({
      squares: squares,
      pixelWidth: pixelWidth,
      iterationInterval: iterationInterval
  });
  let [golSketch, setGolSketch] = useState();

  useEffect(() => {
    setSketchOptions({
      squares: squares,
      pixelWidth: pixelWidth,
      iterationInterval: iterationInterval
    });
  }, [squares, pixelWidth, iterationInterval]);

  useEffect(() => {
    console.log('this is the on load useEffect');
    setGolSketch(new window.p5(gol(sketchOptions), "sketch"));
  }, []);

  const handleSubmit = (event) => {
    golSketch.remove();
    console.log(sketchOptions, squares);
    setGolSketch(new window.p5(gol(sketchOptions), "sketch"));
    event.preventDefault();
  };
   
  const squaresChange = (event) =>  {
    if (event.target.value === "") {
      setSquares(0);
    } else {
      setSquares(parseInt(event.target.value));
    }
  };

  const iterationIntervalChange = (event) =>  {
    if (event.target.value === "") {
      setIterationInterval(0);
    } else {
      setIterationInterval(parseInt(event.target.value));
    }
  };


  return (
    <>
      <div id="sketch">
      </div>
      <button onClick={() => {
        setGameRunning(!gameRunning);
        toggleGame();
      }}>
        {gameRunning &&
            "Stop"
        }
        {!gameRunning &&
            "Start"
        }
      </button>
      <button onClick={clearGame}>
        Clear
      </button>
      <form onSubmit={handleSubmit}>
        <label>
          Number of squares across:&nbsp;
          <input
            type="text"
            value={squares.toString()}
            onChange={squaresChange}
          />
        </label>
        <br/>
        <label>
          Iteration interval (ms):&nbsp;
          <input
            type="text"
            value={iterationInterval.toString()}
            onChange={iterationIntervalChange}
          />
        </label>
        <br/>
        <input type="submit" value="Update Game of Life" />
      </form>
    </>
  );
}

export default Sketch;
      // <Typography id="iteration-interval-slider" variant="overline" >
      //   Iteration Interval
      // </Typography>
      // <Slider
      //   aria-label="Iteration Interval"
      //   aria-labelledby="iteration-interval-slider"
      //   aria-valuetext="milliseconds between iterations"
      //   aria-labelledby="discrete-slider"
      //   getAriaValueText={(val) => `${val} milliseconds`}
      //   defaultValue={100}
      //   min={10}
      //   max={5000}
      //   value={iterationInterval}
      //   // scale={(x) => x ** 10}
      //   onChangeCommitted={(event, interval) => setIterationInterval(interval)}
      //   marks={[
      //     { 'value': 10 },
      //     { 'value': 20 },
      //     { 'value': 50 },
      //     { 'value': 100 },
      //     { 'value': 500 },
      //     { 'value': 1000 },
      //     { 'value': 2000 },
      //     { 'value': 5000 },
      //   ]}
      // />
