import React, { useState, useEffect } from 'react';
import { gol, toggleGame, resetGame, iterateGrid } from '../gol'
import {Slider, Typography} from '@material-ui/core'
import { presetObjects } from '../presetObjects';

function Sketch() {

  let [squares, setSquares] = useState(100);
  let [pixelWidth, setPixelWidth] = useState(600);
  let [iterationInterval, setIterationInterval] = useState(50);
  let [gameRunning, setGameRunning] = useState(false);
  let [generation, setGeneration] = useState(0);
  let [initialRandom, setInitialRandom] = useState(30);
  let [presetObject, setPresetObject] = useState("--empty grid--");
  let [sketchOptions, setSketchOptions] = useState({
      setGeneration: setGeneration,
      setGameRunning: setGameRunning,
      squares: squares,
      pixelWidth: pixelWidth,
      iterationInterval: iterationInterval,
      initialRandom: initialRandom,
      preset: presetObject
  });
  let [golSketch, setGolSketch] = useState();

  useEffect(() => {
    setSketchOptions({
      ...sketchOptions,
      squares: squares,
      pixelWidth: pixelWidth,
      iterationInterval: iterationInterval,
      initialRandom: initialRandom,
      preset: presetObject,
    });
  }, [squares, pixelWidth, iterationInterval, initialRandom, presetObject]);

  useEffect(() => {
    setGolSketch(new window.p5(gol(sketchOptions), "sketch"));
  }, []);

  const handleSubmit = (event) => {
    golSketch.remove();
    setGeneration(0);
    setGolSketch(new window.p5(gol(sketchOptions), "sketch"));
    event.preventDefault();
  };
   
  const squaresChange = (event) => {
    if (event.target.value === "") {
      setSquares(0);
    } else {
      setSquares(parseInt(event.target.value));
    }
  };

  const iterationIntervalChange = (event) => {
    if (event.target.value === "") {
      setIterationInterval(0);
    } else {
      setIterationInterval(parseInt(event.target.value));
    }
  };

  const initialRandomnessChange = (event) => {
    if (event.target.value === "") {
      setInitialRandom(0);
    } else {
      setInitialRandom(parseInt(event.target.value));
    }
  };

  const presetChange = (event) => {
    setPresetObject(event.target.value);
  };


  return (
    <>
      <div id="sketch">
      </div>
      <p>Generation: {generation}</p>
      <button onClick={() => {
        toggleGame();
      }}>
        {gameRunning &&
            "Pause"
        }
        {!gameRunning &&
            "Start"
        }
      </button>
      <button onClick={resetGame}>Reset</button>
      <button onClick={iterateGrid}>Next Iteration</button>
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
        <label>
          Initial randomness (%):&nbsp;
          <input
            type="text"
            value={initialRandom.toString()}
            onChange={initialRandomnessChange}
          />
        </label>
        <br/>
        <label>
          Load preset object:&nbsp;
          <select value={presetObject} onChange={presetChange}>
            { Object.keys(presetObjects).map((key) => (
              <option key={key} value={key}>{key}</option>
            )) }
          </select>
        </label>
        <br/>
        <input type="submit" value="Update Game" />
      </form>
      <div className="game-description">
        <p>
          This is Conway's <strong>Game of Life</strong>.
          It is a cellular automaton represented by a grid of cells that are either "alive" or "dead".
          Three simple rules determine the next state of the game.
        </p>
        <ol>
          <li>Any live cell with two or three live neighbors survives.</li>
          <li>Any dead cell with three live neighbours becomes alive.</li>
          <li>All other cells die or stay dead.</li>
        </ol>
        <p>
          With just these three rules, complex structures emerge that exhibit a range of interesting behaviors.
          Some persist indefinitely. Some generate other structures. Some even replicate themselves.
        </p>
      </div>
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
