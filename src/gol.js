// Dynamic functions I want to expose to the react app:
// * (DONE) start game
// * (DONE) stop game
// * (DONE) reset game
// * (DONE) set interval

// Initialization variable to expose:
// * (DONE) pixel width
// * (DONE) # of squares
// * (DONE) initial grid values
// * edge type: Dead edges, live edges, taurus edges
// * rule chages
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
//    * Quadtree method. Somehow use this to not evaluate whole regions of the
//      space
//    * Change list method. If a cell didn't change, and none of it's
//      neighbors changed. It cant have changed. But what does this speed up?
//      Oh. Only evaluate the state around cells that have changed. So rather
//      than iterating through the whole grid to evaluate state change,
//      iterate through the previous change list and their surrounding cells.
//      Basically, iterate through the change list, and create a "possible
//      change list" of all adjacent cells and iterate those cells to evaluate
//      their new state.
// * Inner-loop lookup table based on bit patterns of the 9 cells. 
//   Rather than counting your neighbors and using conditional logic to
//   determine the next state, you count your neighbors and pull the value
//   from a lookup table. I don't think this does much?
// * One big inefficiency is that you're looking up the state of a cell
//   multiple times. 8 times. Once for each of it's neighbors. Is there a way
//   to "save" those lookups, so you only have to do them once?
// * Store each cell's neighbor count rather than it's state (well you would
//   need both). Normally this doesn't improve anything because you still have
//   to iterate through the whole grid to update neighbor counts, but if
//   you're only update the changed cells and their neighbors, this might work. 

import { presetObjects } from './presetObjects';

// Functions to export to the React app
let toggleGame;
let resetGame;
let iterateGrid;

const gol = (opts) => { 

  return (p) => {

    const iterationInterval = opts.iterationInterval || 100; // Default value
    const pixelWidth = opts.pixelWidth || 600;
    const squares = opts.squares || 25;
    const squareSize = pixelWidth/squares;
    let generation = 0;
    let gameRunning = false;
    let gameInterval = setInterval(p.iterateGrid, iterationInterval);
    // Arrays used to store cells that change from one gen to the next
    let births = [];
    let deaths = [];

    p.setup = () => {
      const canvas = p.createCanvas(pixelWidth, pixelWidth);
      canvas.mouseClicked(p.clickHandler);

      p.stroke(210);
      p.strokeCap(p.SQUARE);
      // Decreasing border width with square width
      if (squareSize > 10) {
        p.strokeWeight(2);
      } else if (squareSize > 5) {
        p.strokeWeight(1);
      } else {
        p.strokeWeight(0);
      }
      p.noLoop();
      p.buildLifeGrids();

      if (presetObjects[opts.preset]) {
        const center = Math.floor(squares/2);
        presetObjects[opts.preset].forEach((pair) => {
          lifeGrid[pair[0] + center][pair[1] + center] = 1;
        });
        p.redraw();
      }
      //p.noSmooth();
    };


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


    let lifeGrid;
    let lifeGridBuffer;
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
      p.bufferNextGridState();
    }

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


    p.countNeighbors = (i, j) => {
      // No wrap. Border "cells" are dead.
    //  return adjacentCells.reduce(function(count, pair) {
    //    const xCoord = i + pair[0];
    //    const yCoord = j + pair[1];
    //    if (xCoord === lifeGrid.length ||
    //        xCoord === -1 ||
    //        yCoord === lifeGrid.length ||
    //        yCoord === -1) {
    //      return count;
    //    } else {
    //      return count + lifeGrid[xCoord][yCoord];
    //    }
    //  }, 0);
      // Wrap
      return adjacentCells.reduce(function(count, pair) {
          const xCoord = (i + pair[0] + squares) % squares;
          const yCoord = (j + pair[1] + squares) % squares;
          return count + lifeGrid[xCoord][yCoord];
      }, 0);
    };


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


    p.bufferNextGridState = () => {
      births.length = 0
      deaths.length = 0
      lifeGrid.forEach(function(gridColumn, i) {
        gridColumn.forEach(function(cell, j) {
          lifeGridBuffer[i][j] = p.nextCellState(i, j);
        });
      });
    };


    p.iterateGrid = () => {
      // Swap the grids
      const tempGrid = lifeGrid;
      lifeGrid = lifeGridBuffer;
      lifeGridBuffer = tempGrid;
      p.setGeneration(generation + 1);
      
      // Draw the new grid, which will buffer the next one
      p.fastDraw();
    };


    p.setGeneration = (gen) => {
      generation = gen;
      opts.setGeneration(generation);
    };


    p.resetGame = () => {
      p.setGeneration(0);
      if (gameRunning) {
        p.toggleGame();
      }
      p.buildLifeGrids();
      p.redraw();
    };


    // Draw all the cells
    p.fullDraw = () => {
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
    };

    // Only draw the cells that changed
    p.fastDraw = () => {
      p.fill(60);
      births.forEach((birthCell) => {
        p.rect(birthCell[0] * squareSize, birthCell[1] * squareSize, squareSize);
      });
      p.fill(240);
      deaths.forEach((birthCell) => {
        p.rect(birthCell[0] * squareSize, birthCell[1] * squareSize, squareSize);
      });
      p.bufferNextGridState();
    }

    p.draw = () => {
      // Draw the grid
      p.fullDraw();
      // Buffer the next iteration immediately after
      p.bufferNextGridState();
    };


    p.mouseGridCoordinate = (x, y) => {
      return [Math.floor(p.mouseX/squareSize), Math.floor(p.mouseY/squareSize)]
    };


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


    // Assigning local functions to outer variables for exporting
    toggleGame = p.toggleGame;
    resetGame = p.resetGame;
    iterateGrid = p.iterateGrid;
  };
};

export { gol, toggleGame, resetGame, iterateGrid };
