import { Ship, Gameboard, Player } from "./index.js";

/* =====================================================
   GLOBAL PLACEMENT STATE
===================================================== */
let selectedShip = null;
let selectedDirection = "horizontal";
let isPlacingShip = false;

/* =====================================================
   RENDER BOARD
===================================================== */
function renderBoard(board, container, title, showShips = false){
  container.innerHTML = "";

  const heading = document.createElement("h2");
  heading.textContent = title;
  heading.style.textAlign = "center";
  container.appendChild(heading);

  board.board.forEach((row, x) => {
    const rowEl = document.createElement("div");
    rowEl.classList.add("row");

    row.forEach((cell, y) => {
        const cellEl = document.createElement("div");
        cellEl.classList.add("cell");
        cellEl.dataset.x = x;
        cellEl.dataset.y = y;
      
        if (cell.state === "hit") cellEl.classList.add("hit");
        if (cell.state === "miss") cellEl.classList.add("miss");
      
        if (showShips && cell.ship) {
          cellEl.classList.add("ship-cell");
        }
      
        rowEl.appendChild(cellEl);
      });      

    container.appendChild(rowEl);
  });
}

/* =====================================================
   PLAYER ATTACK HANDLING
===================================================== */
function handlePlayerClick(board, cellEl, playerBoard, computerBoard) {
  const x = Number(cellEl.dataset.x);
  const y = Number(cellEl.dataset.y);
  const cell = board.board[x][y];

  if (cell.state !== "empty") return;

  board.receiveAttack(x, y);
  renderBoard(board, document.querySelector("#computer-board"), "Computer Board");

  if (cell.state === "hit") {
    alert("You hit a ship!");
    if (cell.ship.isSunk()) alert("You sunk a ship!");
  } else {
    alert("You missed!");
  }

  if (board.endOfGame()) {
    alert("GAME OVER! You win!");
    return;
  }

  setTimeout(() => {
    computerMove(playerBoard, computerBoard);
  }, 400);
}

function addCellListeners(board, playerBoard, computerBoard) {
  const container = document.querySelector("#computer-board");

  container.addEventListener("click", e => {
    if (!e.target.classList.contains("cell")) return;
    handlePlayerClick(board, e.target, playerBoard, computerBoard);
  });
}

/* =====================================================
   COMPUTER MOVE
===================================================== */
function computerMove(playerBoard, computerBoard) {
  let x, y, cell;

  do {
    [x, y] = computerBoard.getMove();
    cell = playerBoard.board[x][y];
  } while (cell.state !== "empty");

  playerBoard.receiveAttack(x, y);
  renderBoard(playerBoard, document.querySelector("#player-board"), "Player Board", true);
  
  if (cell.state === "hit") {
    alert("Computer hit your ship!");
    if (cell.ship.isSunk()) alert("Computer sunk your ship!");
  } else {
    alert("Computer missed!");
  }

  if (playerBoard.endOfGame()) {
    alert("GAME OVER! Computer wins!");
  }
}

/* =====================================================
   RANDOM COMPUTER SHIP PLACEMENT
===================================================== */
function placeRandomShips(board) {
  const ships = [5, 4, 3, 3, 2];

  ships.forEach(length => {
    let placed = false;
    while (!placed) {
      const x = Math.floor(Math.random() * board.size);
      const y = Math.floor(Math.random() * board.size);
      const dir = Math.random() < 0.5 ? "horizontal" : "vertical";
      placed = board.placeShip(new Ship(length), x, y, dir);
    }
  });
}

/* =====================================================
   SHIP PALETTE SETUP
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".ship").forEach(shipEl => {
    shipEl.addEventListener("click", () => {
      if (isPlacingShip) return;

      selectedShip = {
        el: shipEl,
        length: Number(shipEl.dataset.length)
      };

      selectedDirection = "horizontal";
      isPlacingShip = true;

      shipEl.style.position = "absolute";
      shipEl.style.opacity = "0.7";
      shipEl.style.zIndex = "1000";
      shipEl.style.pointerEvents = "none";
    });
  });
});

/* =====================================================
   SHIP FOLLOWS CURSOR
===================================================== */
document.addEventListener("mousemove", e => {
  if (!selectedShip || !isPlacingShip) return;

  selectedShip.el.style.left = e.pageX + "px";
  selectedShip.el.style.top = e.pageY + "px";
});

/* =====================================================
   ROTATE SHIP ON CLICK
===================================================== */
document.querySelector("#player-board").addEventListener("click", e => {
  if (!selectedShip || !isPlacingShip) return;
  if (!e.target.classList.contains("cell")) return;

  selectedDirection =
    selectedDirection === "horizontal" ? "vertical" : "horizontal";

  selectedShip.el.style.transform =
    selectedDirection === "horizontal"
      ? "rotate(0deg)"
      : "rotate(90deg)";
});

/* =====================================================
   PLACE SHIP ON DOUBLE CLICK
===================================================== */
document.querySelector("#player-board").addEventListener("dblclick", e => {
  if (!selectedShip || !isPlacingShip) return;
  if (!e.target.classList.contains("cell")) return;

  const x = Number(e.target.dataset.x);
  const y = Number(e.target.dataset.y);

  const ship = new Ship(selectedShip.length);
  const success = human.board.placeShip(
    ship,
    x,
    y,
    selectedDirection
  );

  if (!success) {
    selectedShip.el.style.border = "2px solid red";
    setTimeout(() => (selectedShip.el.style.border = ""), 300);
    return;
  }

  selectedShip.el.remove();
  selectedShip = null;
  isPlacingShip = false;

renderBoard(human.board, document.querySelector("#player-board"), "Player Board", true);
});

function cancelPlacement() {
    if (!selectedShip) return;
  
    selectedShip.el.style.position = "";
    selectedShip.el.style.opacity = "";
    selectedShip.el.style.zIndex = "";
    selectedShip.el.style.left = "";
    selectedShip.el.style.top = "";
    selectedShip.el.style.transform = "";
    selectedShip.el.style.pointerEvents = "";
  
    selectedShip = null;
    isPlacingShip = false;
  }  

/* =====================================================
   INITIALIZE GAME
===================================================== */
const human = new Player("Cory");
const computer = new Player("CPU", "computer");

renderBoard(human.board, document.querySelector("#player-board"), "Player Board", true);
renderBoard(computer.board, document.querySelector("#computer-board"), "Computer Board");

addCellListeners(computer.board, human.board, computer.board);
placeRandomShips(computer.board);
