# Fast Game of Life

This is a fast, JavaScript implementation of Conway's **Game of Life**. The Game of Life is a cellular automaton designed to produce interesting, long-running emergent structures.

The game is represented by a grid of cells that are either "alive" or "dead". Based on the state of these cells, the next iteration of the game is calculated and displayed at regular intervals. Three simple rules determine the next state of the game:
* Any live cell with two or three live neighbors survives.
* Any dead cell with three live neighbours becomes alive.
* All other cells die or stay dead.

With just these three rules, complex structures emerge that exhibit a range of interesting behaviors. Some persist indefinitely. Some generate other structures. Some even replicate themselves.

## Technologies

* React to build the UI and manage it's iteraction with the game state
* [p5.js](https://p5js.org/) to handle the canvas based graphics

## Optimization Techniques

While the rules of Conway's Game of Life are quite simple to implement in code, doing so performantly requires some non-obvious optimizations. These are a few that I implemented to drastically increase the size and iteration speed this version is capable of:
* Double buffer - Keep both the current state and next iteration in memory. Compute the next iteration immediately after drawing the current state and before the next redraw is triggered.
* Change list - Maintain a list of cells who's state changed in the previous iteration and only iterate these cells and their neighbors on the next iteration
* Redraw diff - Only redraw cells whose state has changed
* Single fill swap - Redraw all the cells of a single state in one pass before swapping the fill color once rather than redrawing the cells in order and swaping the fill color repeatedly




