export class Ship {
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
export class Gameboard {
    constructor() {
      this.ships = [];
      this.size = 10;
      this.board = [];
  
      for (let i = 0; i < 10; i++) {
        const row = [];
        for (let j = 0; j < 10; j++) {
          row.push({ x: i, y: j, state: "empty", ship: null });
        }
        this.board.push(row);
      }
    } // ✅ constructor CLOSED here
  
    placeShip(ship, startX, startY, direction = "horizontal") {
      const coords = [];
  
      for (let i = 0; i < ship.length; i++) {
        let x = startX;
        let y = startY;
  
        if (direction === "horizontal") y += i;
        else x += i;
  
        if (
          x >= this.size ||
          y >= this.size ||
          this.board[x][y].ship
        ) {
          return false;
        }
  
        coords.push([x, y]);
      }
  
      coords.forEach(([x, y]) => {
        this.board[x][y].ship = ship;
      });
  
      this.ships.push(ship);
      return true;
    }
  
    receiveAttack(x, y) {
      const cell = this.board[x][y];
  
      if (cell.ship) {
        if (cell.state !== "empty") return;
        cell.ship.hit();
        cell.state = "hit";
      } else {
        cell.state = "miss";
      }
    }
  
    endOfGame() {
      return (
        this.ships.length > 0 &&
        this.ships.every(ship => ship.sunk)
      );
    }
  }
  
//There will be two types of players in the game, ‘real’ players and ‘computer’ players.
//Each player object should contain its own gameboard.
export class Player {
  constructor(name, type ="human") {
    this.name = name;
    this.type = type;
    this.board = new Gameboard();
  }

  getMove(){
    if(this.type === "computer"){
        const x = Math.floor(Math.random() * 10);
        const y = Math.floor(Math.random() * 10);
        return [x, y];
    }
    return null;
  }
}