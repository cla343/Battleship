import { Ship, Gameboard, Player } from "./index.js";

// Render a board in the container
function renderBoard(board, container, title) {
    container.innerHTML = "";

    const heading = document.createElement("h1");
    heading.textContent = title;
    heading.style.textAlign = "center"; // optional styling
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

            rowEl.appendChild(cellEl);
        });

        container.appendChild(rowEl);
    });
}

// Handles human player's click
function handlePlayerClick(board, cellEl, playerBoard, computerBoard) {
    const x = parseInt(cellEl.dataset.x);
    const y = parseInt(cellEl.dataset.y);
    const cell = board.board[x][y];

    // Ignore clicks on already attacked cells
    if (cell.state !== "empty") return;

    // Player attack
    board.receiveAttack(x, y);
    renderBoard(board, document.querySelector("#computer-board"));

    if (cell.state === "hit") {
        alert("You hit a ship!");
        if (cell.ship.isSunk()) alert("You sunk a ship!");
    } else {
        alert("You missed!");
    }

    // Check if player won
    if (board.endOfGame()) {
        alert("GAME OVER! You win!");
        return;
    }

    // Computer's turn
    setTimeout(() => {
        computerMove(playerBoard, computerBoard);
    }, 300); // small delay for UX
}

// Add click listeners for the player's attacks
function addCellListeners(board, playerBoard, computerBoard) {
    const container = document.querySelector("#computer-board");

    container.addEventListener("click", (e) => {
        const cellEl = e.target;
        if (!cellEl.classList.contains("cell")) return;

        const x = cellEl.dataset.x;
        const y = cellEl.dataset.y;

        const confirmed = confirm(
            `Attack cell (${x}, ${y})?`
        );

        if (!confirmed) return;

        handlePlayerClick(board, cellEl, playerBoard, computerBoard);
    });
}

// Computer randomly attacks player's board (avoiding repeats)
function computerMove(playerBoard, computerBoard) {
    let x, y, cell;
    do {
        [x, y] = computerBoard.getMove();
        cell = playerBoard.board[x][y];
    } while (cell.state !== "empty");

    playerBoard.receiveAttack(x, y);
    renderBoard(playerBoard, document.querySelector("#player-board"));

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

function placeRandomShip(board) {
    // Standard ships: name and length
    const shipsToPlace = [
        { name: "Carrier", length: 5 },
        { name: "Battleship", length: 4 },
        { name: "Cruiser", length: 3 },
        { name: "Submarine", length: 3 },
        { name: "Destroyer", length: 2 },
    ];

    shipsToPlace.forEach(shipInfo => {
        const ship = new Ship(shipInfo.length);

        let placed = false;
        while (!placed) {
            const x = Math.floor(Math.random() * board.size);
            const y = Math.floor(Math.random() * board.size);
            const direction = Math.random() < 0.5 ? "horizontal" : "vertical";

            placed = board.placeShip(ship, x, y, direction);
        }
    });
}

let selectedShip = null;
let selectedDirection = "horizontal"; // optionally toggle with a button

document.querySelectorAll(".ship").forEach(shipEl => {
  shipEl.addEventListener("click", () => {
    // Highlight selected ship
    document.querySelectorAll(".ship").forEach(el => el.classList.remove("selected"));
    shipEl.classList.add("selected");

    // Track the selected ship
    selectedShip = {
      name: shipEl.dataset.name,
      length: parseInt(shipEl.dataset.length),
      el: shipEl
    };
  });
});

document.addEventListener("mousemove", e => {
    if (!selectedShip) return;
    // move the ship’s element with the pointer
    selectedShip.el.style.position = "absolute";
    selectedShip.el.style.left = e.pageX + "px";
    selectedShip.el.style.top = e.pageY + "px";
    selectedShip.el.style.opacity = 0.7; // semi-transparent while dragging
  });
  
  document.querySelector("#player-board").addEventListener("click", e => {
    if (!selectedShip) return;
  
    const cell = e.target;
    if (!cell.classList.contains("cell")) return;
  
    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);
  
    const shipObj = new Ship(selectedShip.length);
    const success = human.board.placeShip(shipObj, x, y, selectedDirection);
  
    if (success) {
      alert(`${selectedShip.name} placed!`);
      selectedShip.el.remove(); // remove from palette
      selectedShip = null;
      renderBoard(human.board, document.querySelector("#player-board"));
    } else {
      alert("Invalid placement. Try again!");
    }
  });
  
// Example usage:
const human = new Player("Cory");
const computer = new Player("CPU", "computer");

// Render initial boards
renderBoard(human.board, document.querySelector("#player-board"), "Player Board");
renderBoard(computer.board, document.querySelector("#computer-board"), "Computer Board");

// Attach click listeners
addCellListeners(computer.board, human.board, computer.board);

//Randomly place ships
placeRandomShip(computer.board);
