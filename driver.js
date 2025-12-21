const { Ship, Gameboard, Player } = require("./index");

function renderBoard(board, container){
    container.innerHTML = "";

    board.board.forEach((row, x) => {
        const rowEl = document.createElement('div');
        rowEl.classList.add("row");

        row.forEach((cell, y) => {
        const cellEl = document.createElement('div');
        cellEl.classList.add("cell");
        cellEl.dataset.x = x;
        cellEl.dataset.y = y;

        if(cell.state === "hit") cellEl.classList.add("hit");
        if(cell.state === "miss") cellEl.classList.add("miss");

        rowEl.appendChild(cellEl);
    });
    rowEl.appendChild(rowEl);
    });
}

function addCellListeners(board){
    const container = document.querySelector("#computer-board");

    container.addEventListener("click", (e) => {
        const cellEl = e.target;
        if (!cellEl.classList.contains("cell")) return;

        const x = parseInt(cellEl.dataset.x);
        const y = parseInt(cellEl.dataset.y);

        board.receiveAttack(x, y);
        renderBoard(board, container);
    });
}

function computerMove(playerBoard){
    const[x, y] = playerBoard.getMove();
    playerBoard.receiveAttack(x, y);
    renderBoard(playerBoard, document.querySelector("#player-board"));
}