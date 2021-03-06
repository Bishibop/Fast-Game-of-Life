import React, { useState, useEffect } from 'react';
import { gol, toggleGame, resetGame, iterateGrid } from '../gol'
import { presetObjects } from '../presetObjects';

function Sketch() {

  let [squares, setSquares] = useState(100);
  let [pixelWidth, setPixelWidth] = useState(600);
  let [iterationInterval, setIterationInterval] = useState(50);
  let [gameRunning, setGameRunning] = useState(false);
  let [generation, setGeneration] = useState(0);
  let [initialRandom, setInitialRandom] = useState(30);
  let [presetObject, setPresetObject] = useState("--empty grid--");
  let [edgeRule, setEdgeRule] = useState("wrap");
  let [sketchOptions, setSketchOptions] = useState({
      setGeneration: setGeneration,
      setGameRunning: setGameRunning,
      squares: squares,
      pixelWidth: pixelWidth,
      iterationInterval: iterationInterval,
      initialRandom: initialRandom,
      preset: presetObject,
      edgeRule: edgeRule
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
      edgeRule: edgeRule
    });
  }, [ squares,
       pixelWidth,
       iterationInterval,
       initialRandom,
       presetObject,
       edgeRule ]
  );

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

  const edgeRuleChange = (event) => {
    setEdgeRule(event.target.value);
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
      <span>&nbsp;:&nbsp;</span>
      <button onClick={resetGame}>Reset</button>
      <span>&nbsp;:&nbsp;</span>
      <button onClick={iterateGrid}>Next Iteration</button>
      <br/>
      <br/>
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
        <br/>
        <div className="edge-rule-label">Edge Rule: </div>
        <div className="edge-rule-options">
          <label>
            <input
              type="radio"
              name="edge-rule"
              value="wrap"
              checked={edgeRule === "wrap"}
              onChange={edgeRuleChange}
            />
            &nbsp;Toroidal Wrap
          </label>
          <br/>
          <label>
            <input
              type="radio"
              name="edge-rule"
              value="dead"
              checked={edgeRule === "dead"}
              onChange={edgeRuleChange}
            />
            &nbsp;Dead border
          </label>
          <br/>
          <label>
            <input
              type="radio"
              name="edge-rule"
              value="alive"
              checked={edgeRule === "alive"}
              onChange={edgeRuleChange}
            />
            &nbsp;Alive border
          </label>
        </div>
        <br/>
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
