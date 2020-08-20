const gol = p => {
  console.log('hello from the sketch');

  const pixelWidth = 600;
  const squares = 50;
  const squareSize = pixelWidth/squares;
  const iterationInterval = 100;
  let gameInterval;
  let gameRunning = false;

  let lifeGrid = []
  for (let i of Array(squares).keys()) {
    lifeGrid.push(Array(squares).fill(0));
  }
  let lifeGridBuffer = []
  for (let i of Array(squares).keys()) {
    lifeGridBuffer.push(Array(squares).fill(0));
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


  p.startGame = () => {
    gameInterval = setInterval(p.iterateGrid, iterationInterval);
    gameRunning = true;
  };


  p.stopGame = () => {
    clearInterval(gameInterval);
    gameRunning = false;
  };


  p.clearGame = () => {
  };


  p.setup = () => {
    p.createCanvas(pixelWidth, pixelWidth);
    //background(backgroundColor);
    p.stroke(210);
    p.strokeCap(p.SQUARE);
    p.strokeWeight(2);
    p.noLoop();
    //p.noSmooth();
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
    p.bufferNextGridState();
  };


  p.mouseClicked = () => {
    const [x, y] = p.mouseGridCoordinate();
    if (lifeGrid[x][y]) {
      lifeGrid[x][y] = 0;
    } else {
      lifeGrid[x][y] = 1;
    }
    p.redraw();
    return false;
  };


  p.keyPressed = () => {
    if (p.keyCode === 32) {
      if (gameRunning) {
        p.stopGame();
      } else {
        p.startGame();
      }
    }
  };


  p.mouseGridCoordinate = (x, y) => {
    return [Math.floor(p.mouseX/squareSize), Math.floor(p.mouseY/squareSize)]
  };
};

export default gol;
