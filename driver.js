const { Ship, Gameboard, Player } = require("./index");

// Render a board in the container
function renderBoard(board, container) {
    container.innerHTML = "";

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

// Example usage:
const human = new Player("Cory");
const computer = new Player("CPU", "computer");

// Render initial boards
renderBoard(human.board, document.querySelector("#player-board"));
renderBoard(computer.board, document.querySelector("#computer-board"));

// Attach click listeners
addCellListeners(computer.board, human.board, computer.board);
