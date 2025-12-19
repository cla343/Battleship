class Ship {
  constructor(length) {
    this.length = length;
    this.hits = 0;
    this.sunk = false;
  }

  //did the attack coordinates === opponents ship position
  hit() {
    this.hits++;
    this.isSunk();
  }

  //does the hitCount === length ; if so sunk
  isSunk() {
    if (this.hits >= this.length) {
      this.sunk = true;
      return true;
    }
    return false;
  }
}

//Gameboards should keep track of missed attacks so they can display them properly.
//Gameboards should be able to report whether or not all of their ships have been sunk.
class Gameboard {
  constructor() {
    let board = [];
    for (let i = 0; i < 10; i++) {
      for (let j; j < 10; j++) {
        board.push(i, j);
      }
    }
  }

  //takes a pair of coordinates, determines whether or not the attack hit a ship and then sends the ‘hit’ function to the correct ship, or records the coordinates of the missed shot.
  receiveAttack(shipCoordinate, attackCoordinate) {}
}

//There will be two types of players in the game, ‘real’ players and ‘computer’ players.
//Each player object should contain its own gameboard.
class Player {
  constructor() {}
}

module.exports = Ship; //exporting for tests
