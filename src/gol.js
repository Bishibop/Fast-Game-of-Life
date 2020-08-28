// Dynamic functions I want to expose to the react app:
// * (DONE) start game
// * (DONE) stop game
// * (DONE) reset game
// * (DONE) set interval

// Initialization variable to expose:
// * (DONE) pixel width
// * (DONE) # of squares
// * (DONE) initial grid values
// * (DONE) edge type: Dead edges, live edges, taurus edges
// * rule changes
//
//
// Optimizations
// * (DONE) If the cell is the same as in the previous generation, you don't
//   need to redraw it. This could cut evaluation time in half since many cells
//   stay the same.
// * (DONE) Paint each color of pixel in groups, rather than left to right, top down.
//   Fewer times to switch the fill color
// * Don't calculate the state of cells that cannot have changed
//   How do you do this?
//    * (DONE) Change list method. If a cell didn't change, and none of it's
//      neighbors changed. It cant have changed. But what does this speed up?
//      Oh. Only evaluate the state around cells that have changed. So rather
//      than iterating through the whole grid to evaluate state change,
//      iterate through the previous change list and their surrounding cells.
//      Basically, iterate through the change list, and create a "possible
//      change list" of all adjacent cells and iterate those cells to evaluate
//      their new state.
//    * Quadtree method. Somehow use this to not evaluate whole regions of the
//      space
// * Inner-loop lookup table based on bit patterns of the 9 cells. 
//   Rather than counting your neighbors and using conditional logic to
//   determine the next state, you count your neighbors and pull the value
//   from a lookup table. I don't think this does much? I also don't think
//   I understand the technique.
// * One big inefficiency is that you're looking up the state of a cell
//   multiple times. 8 times. Once for each of it's neighbors. Is there a way
//   to "save" those lookups, so you only have to do them once?
// * Store each cell's neighbor count rather than it's state (well you would
//   need both). Normally this doesn't improve anything because you still have
//   to iterate through the whole grid to update neighbor counts, but if
//   you're only update the changed cells and their neighbors, this might work. 
// * Parallelization

import { presetObjects } from './presetObjects';


// Functions to export to the React app
let toggleGame;
let resetGame;
let iterateGrid;


// Wrapper function to pass in parameters and callback functions
const gol = (opts) => { 

  return (p) => {

    // Parameters of the game
    const iterationInterval = opts.iterationInterval;
    const pixelWidth = opts.pixelWidth;
    const squares = opts.squares;
    const squareSize = pixelWidth/squares;

    // Internal state of the game
    let generation = 0;
    let gameRunning = false;
    const births = [];
    const deaths = [];
    const possibleChangeSet = new Set();
    let lifeGrid;
    let lifeGridBuffer;

    // Sets the interval, which actually runs the game
    let gameInterval = setInterval(p.iterateGrid, iterationInterval);

    p.setup = () => {
      const canvas = p.createCanvas(pixelWidth, pixelWidth);
      canvas.mouseClicked(p.clickHandler);

      // Drawing parameters of the sketch
      p.stroke(210);
      p.strokeCap(p.SQUARE);

      // Decreases border width with square width
      if (squareSize > 10) {
        p.strokeWeight(2);
      } else if (squareSize > 5) {
        p.strokeWeight(1);
      } else {
        p.strokeWeight(0);
      }

      // Disables anti-aliasing for faster rendering
      p.noSmooth();

      // Disables auto drawing
      p.noLoop();

      // Set the edge rule: alive, dead or wrap
      if (opts.edgeRule === "wrap") {
        p.countNeighbors = p.countNeighborsWrap;
      } else if (opts.edgeRule === "dead") {
        p.countNeighbors = p.countNeighborsDead;
      } else {
        p.countNeighbors = p.countNeighborsAlive;
      }


      // Initializes the grid and buffer
      p.buildLifeGrids();

      // Sets the preset object
      p.setPresetObject();
    };


    p.buildLifeGrids = () => {
      lifeGrid = Array(squares).fill(null).map(() => {
        return Array(squares).fill(null).map(() => {
          if (Math.random() > opts.initialRandom / 100) {
            return 0;
          } else {
            return 1;
          }
        });
      });
      lifeGridBuffer = Array(squares).fill(null).map(() => {
        return Array(squares).fill(0);
      });
      p.fullBuffer();
    }


    p.setPresetObject = () => {
      const center = Math.floor(squares/2);
      presetObjects[opts.preset].forEach((pair) => {
        lifeGrid[pair[0] + center][pair[1] + center] = 1;
      });
    };


    // Toggles cells based on mouse clicks
    p.clickHandler = () => {
      if (!gameRunning) {
        const [x, y] = p.mouseGridCoordinate();
        if (lifeGrid[x][y]) {
          lifeGrid[x][y] = 0;
        } else {
          lifeGrid[x][y] = 1;
        }
        p.redraw();
      }
      return false;
    };


    // Converts mouse pixel coordinates into grid coordinates
    p.mouseGridCoordinate = () => {
      return [Math.floor(p.mouseX/squareSize), Math.floor(p.mouseY/squareSize)]
    };


    // Spacebar to start and stop game
    // Right arrow to iterate one generation
    p.keyPressed = () => {
      if (p.keyCode === 32) {
        p.toggleGame();
        // Prevents spacebar from paging down the webpage
        return false;
      } else if (p.keyCode === 39) {
        p.iterateGrid();
      }
    };


    p.toggleGame = () => {
      if (gameRunning) {
        clearInterval(gameInterval);
      } else {
        gameInterval = setInterval(p.iterateGrid, iterationInterval);
      }
      gameRunning = !gameRunning;
      opts.setGameRunning(gameRunning);
    };


    p.resetGame = () => {
      p.setGeneration(0);
      if (gameRunning) {
        p.toggleGame();
      }
      p.buildLifeGrids();
      p.redraw();
    };


    p.iterateGrid = () => {
      // Swap the grid and the buffer
      const tempGrid = lifeGrid;
      lifeGrid = lifeGridBuffer;
      lifeGridBuffer = tempGrid;

      p.setGeneration(generation + 1);
      
      // Draw the new grid, which will buffer the next one
      p.fastDraw();
    };


    // Draw all the cells
    // Used only for initialization and in response to mouse clicks
    p.draw = () => {
      for (let i of Array(squares).keys()) {
        for (let j of Array(squares).keys()) {
          if (lifeGrid[i][j]) {
            p.fill(60);
          } else {
            p.fill(240);
          }
          p.rect(i * squareSize, j * squareSize, squareSize);
        }
      }
      // Buffer the next iteration immediately after
      p.fullBuffer();
    };


    // Only draw the cells that have changed
    // Used in game iteration
    // This was an enourmous speedup
    p.fastDraw = () => {
      p.fill(60);
      births.forEach((birthCell) => {
        p.rect(birthCell[0] * squareSize, birthCell[1] * squareSize, squareSize);
      });
      p.fill(240);
      deaths.forEach((birthCell) => {
        p.rect(birthCell[0] * squareSize, birthCell[1] * squareSize, squareSize);
      });
      p.fastBuffer();
    }


    // Calculate buffer from entire state
    // Iterate over the entire grid
    p.fullBuffer = () => {
      // Why are these being set here? I know they have to be. Not sure why.
      // Something to do with the mouse click
      births.length = 0
      deaths.length = 0
      lifeGrid.forEach(function(gridColumn, i) {
        const bufferGridColumn = lifeGridBuffer[i];
        gridColumn.forEach(function(cellValue, j) {
          bufferGridColumn[j] = p.nextCellState(i, j);
        });
      });
    };


    // Calculate buffer from cells that have changed
    //
    // A cell can only change if itself or one of it's neighbors has changed.
    // So, track a list of changed cells, build a new list of their neighbors
    // and calculate the new state only for those cells
    //
    // Massive speedups on sparse grids. 25% self time -> 1%
    // With randomness, the saving almost completely evaporate. 25% -> 19%
    p.fastBuffer = () => {
      const changeList = births.concat(deaths);
      births.length = 0
      deaths.length = 0
      changeList.forEach((cell) => {
        possibleChangeSet.add(`${cell[0]},${cell[1]}`);
        adjacentCells.forEach(function(pair) {
          const xCoord = (cell[0] + pair[0] + squares) % squares;
          const yCoord = (cell[1] + pair[1] + squares) % squares;
          // You need to use strings here because they are immutable
          // If you use Arrays, the set just keeps all the duplicates
          possibleChangeSet.add(`${xCoord},${yCoord}`);
        });
      });
      possibleChangeSet.forEach((cellString) => {
        const cell = cellString.split(',');
        const xCoord = parseInt(cell[0]);
        const yCoord = parseInt(cell[1]);
        lifeGridBuffer[xCoord][yCoord] = p.nextCellState(xCoord, yCoord);
      });
      possibleChangeSet.clear();
    };


    // This is where the actual rules of the game are handled.
    p.nextCellState = (i, j) => {
      const neighborCount = p.countNeighbors(i, j);
      
      if (lifeGrid[i][j]) {
        if (neighborCount === 2 || neighborCount === 3) {
          return 1;
        } else {
          deaths.push([i, j]);
          return 0;
        }
      } else { 
        if (neighborCount === 3) {
          births.push([i, j]);
          return 1;
        } else {
          return 0;
        }
      }
    };


    const adjacentCells = [
      [0, 1],
      [1, 0],
      [-1, 0],
      [1, -1],
      [-1, 1],
      [0, -1],
      [1, 1],
      [-1, -1]
    ];


    // This is the innermost loop. Main speedup opportunity remaining.

    // Edges are dead
    p.countNeighborsDead = (i, j) => {
      return adjacentCells.reduce(function(count, pair) {
          const xCoord = i + pair[0];
          const yCoord = j + pair[1];
          if (xCoord >= squares ||
              xCoord < 0 ||
              yCoord >= squares ||
              yCoord < 0) {
            return count;
          } else {
            return count + lifeGrid[xCoord][yCoord];
          }
      }, 0);
    };


    // Edges are alive
    p.countNeighborsAlive = (i, j) => {
      return adjacentCells.reduce(function(count, pair) {
          const xCoord = i + pair[0];
          const yCoord = j + pair[1];
          if (xCoord >= squares ||
              xCoord < 0 ||
              yCoord >= squares ||
              yCoord < 0) {
            return count + 1;
          } else {
            return count + lifeGrid[xCoord][yCoord];
          }
      }, 0);
    };


    // Edges wrap
    p.countNeighborsWrap = (i, j) => {
      return adjacentCells.reduce(function(count, pair) {
        // Mod squares to get the indicies to wrap
        // Plus squares first to handle negative indicies
          const xCoord = (i + pair[0] + squares) % squares;
          const yCoord = (j + pair[1] + squares) % squares;
          return count + lifeGrid[xCoord][yCoord];
      }, 0);
    };


    // Sets internal game state and external app state
    p.setGeneration = (gen) => {
      generation = gen;
      opts.setGeneration(generation);
    };


    // Assigning local functions to outer variables for exporting
    toggleGame = p.toggleGame;
    resetGame = p.resetGame;
    iterateGrid = p.iterateGrid;
  };
};

export { gol, toggleGame, resetGame, iterateGrid };
