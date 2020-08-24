// Dynamic functions I want to expose to the react app:
// * start game
// * stop game
// * reset game
// * set interval

// Initialization variable to expose:
// * pixel width
// * # of squares
// * initial grid values
// * edge type: Dead edges, live edges, taurus edges
// * rule chages

let toggleGame;
let clearGame;

const gol = (opts) => { 

  return (p) => {

    const iterationInterval = opts.iterationInterval || 100; // Default value
    const pixelWidth = opts.pixelWidth || 600;
    const squares = opts.squares || 25;
    const squareSize = pixelWidth/squares;
    let gameRunning = false;
    let gameInterval = setInterval(p.iterateGrid, iterationInterval);


    p.setup = () => {
      let canvas = p.createCanvas(pixelWidth, pixelWidth);
      canvas.mouseClicked(() => {
        const [x, y] = p.mouseGridCoordinate();
        if (lifeGrid[x][y]) {
          lifeGrid[x][y] = 0;
        } else {
          lifeGrid[x][y] = 1;
        }
        p.redraw();
        return false;
      });

      p.stroke(210);
      p.strokeCap(p.SQUARE);
      p.strokeWeight(2);
      p.noLoop();
      p.buildLifeGrids();
      //p.noSmooth();
    };


    let lifeGrid;
    let lifeGridBuffer;
    p.buildLifeGrids = () => {
      lifeGrid = [];
      lifeGridBuffer = [];
      for (let i of Array(squares).keys()) {
        lifeGrid.push(Array(squares).fill(0));
      }
      for (let i of Array(squares).keys()) {
        lifeGridBuffer.push(Array(squares).fill(0));
      }
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
          return 0;
        }
      } else { 
        if (neighborCount === 3) {
          return 1;
        } else {
          return 0;
        }
      }
    };


    p.bufferNextGridState = () => {
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
      
      // Draw the new grid, which will buffer the next one
      p.redraw();
    };


    p.clearGame = () => {
      if (gameRunning) {
        p.toggleGame();
      }
      p.buildLifeGrids();
      p.redraw();
    };


    p.draw = () => {
      // Draw the grid
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
      p.bufferNextGridState();
    };


    p.mouseGridCoordinate = (x, y) => {
      return [Math.floor(p.mouseX/squareSize), Math.floor(p.mouseY/squareSize)]
    };


    p.keyPressed = () => {
      if (p.keyCode === 32) {
        p.toggleGame();
      }
    };


    p.toggleGame = () => {
      if (gameRunning) {
        clearInterval(gameInterval);
        gameRunning = false;
      } else {
        gameInterval = setInterval(p.iterateGrid, iterationInterval);
        gameRunning = true;
      }
    }


    toggleGame = p.toggleGame;
    clearGame = p.clearGame;
  };
};

export { gol, toggleGame, clearGame };
