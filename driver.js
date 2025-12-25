import { Ship, Gameboard, Player } from "./index.js";

/* =====================================================
   GLOBAL PLACEMENT STATE
===================================================== */
let selectedShip = null;
let selectedDirection = "horizontal";
let isPlacingShip = false;
let gameStarted = false;

const requiredShips = [
  { length: 5, placed: false, name: "Carrier", ship: null },
  { length: 4, placed: false, name: "Battleship", ship: null },
  { length: 3, placed: false, name: "Cruiser", ship: null },
  { length: 3, placed: false, name: "Submarine", ship: null },
  { length: 2, placed: false, name: "Destroyer", ship: null }
];

/* =====================================================
   MESSAGE SYSTEM (replaces alerts)
===================================================== */
function showMessage(text, type = "info") {
  const msgEl = document.querySelector("#message");
  if (!msgEl) {
    const newMsg = document.createElement("div");
    newMsg.id = "message";
    newMsg.className = `message ${type}`;
    newMsg.textContent = text;
    document.body.appendChild(newMsg);
    setTimeout(() => newMsg.remove(), 3000);
    return;
  }
  
  msgEl.textContent = text;
  msgEl.className = `message ${type}`;
  msgEl.style.display = "block";
  
  setTimeout(() => {
    msgEl.style.display = "none";
  }, 3000);
}

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
          cellEl.dataset.shipId = getShipId(cell.ship);
        }
      
        rowEl.appendChild(cellEl);
      });      

    container.appendChild(rowEl);
  });
}

/* =====================================================
   SHIP ID HELPER
===================================================== */
function getShipId(ship) {
  for (let i = 0; i < requiredShips.length; i++) {
    if (requiredShips[i].ship === ship) {
      return i;
    }
  }
  return -1;
}

/* =====================================================
   UPDATE SHIP STATUS UI
===================================================== */
function updateShipStatus() {
  const statusEl = document.querySelector("#ship-status");
  if (!statusEl) return;
  
  statusEl.innerHTML = "<h3>Ships to Place:</h3>";
  const remaining = requiredShips.filter(s => !s.placed);
  
  if (remaining.length === 0) {
    statusEl.innerHTML += "<p style='color: #4CAF50;'>✓ All ships placed! Click Start Game.</p>";
    document.querySelector("#start-game").disabled = false;
  } else {
    remaining.forEach(s => {
      statusEl.innerHTML += `<p>• ${s.name} (${s.length} cells)</p>`;
    });
  }
}

/* =====================================================
   REMOVE SHIP FROM BOARD
===================================================== */
function removeShipFromBoard(board, ship) {
  board.board.forEach(row => {
    row.forEach(cell => {
      if (cell.ship === ship) {
        cell.ship = null;
        cell.state = "empty";
      }
    });
  });
}

/* =====================================================
   PREVIEW PLACEMENT (highlight cells)
===================================================== */
function previewPlacement(x, y, length, direction, board) {
  // Clear previous preview
  document.querySelectorAll(".cell.preview-valid, .cell.preview-invalid").forEach(el => {
    el.classList.remove("preview-valid", "preview-invalid");
  });

  // Check if placement is valid
  let isValid = true;
  const cells = [];
  
  for (let i = 0; i < length; i++) {
    const checkX = direction === "horizontal" ? x : x + i;
    const checkY = direction === "horizontal" ? y + i : y;
    
    if (checkX >= board.size || checkY >= board.size) {
      isValid = false;
      break;
    }
    
    const cell = board.board[checkX][checkY];
    if (cell.ship) {
      isValid = false;
    }
    
    cells.push([checkX, checkY]);
  }

  // Highlight cells
  cells.forEach(([cellX, cellY]) => {
    const cellEl = document.querySelector(`#player-board .cell[data-x="${cellX}"][data-y="${cellY}"]`);
    if (cellEl) {
      cellEl.classList.add(isValid ? "preview-valid" : "preview-invalid");
    }
  });

  return isValid;
}

/* =====================================================
   PLAYER ATTACK HANDLING
===================================================== */
function handlePlayerClick(board, cellEl, playerBoard, computerBoard) {
  if (!gameStarted) {
    showMessage("Place all ships and click Start Game first!", "warning");
    return;
  }

  const x = Number(cellEl.dataset.x);
  const y = Number(cellEl.dataset.y);
  const cell = board.board[x][y];

  if (cell.state !== "empty") return;

  board.receiveAttack(x, y);
  renderBoard(board, document.querySelector("#computer-board"), "Computer Board");

  if (cell.state === "hit") {
    showMessage("You hit a ship!", "success");
    if (cell.ship.isSunk()) {
      showMessage("You sunk a ship!", "success");
    }
  } else {
    showMessage("You missed!", "info");
  }

  if (board.endOfGame()) {
    showMessage("GAME OVER! You win!", "success");
    gameStarted = false;
    return;
  }

  setTimeout(() => {
    computerMove(playerBoard, computerBoard);
  }, 800);
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
    showMessage("Computer hit your ship!", "danger");
    if (cell.ship.isSunk()) {
      showMessage("Computer sunk your ship!", "danger");
    }
  } else {
    showMessage("Computer missed!", "info");
  }

  if (playerBoard.endOfGame()) {
    showMessage("GAME OVER! Computer wins!", "danger");
    gameStarted = false;
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
      if (isPlacingShip || gameStarted) return;

      selectedShip = {
        el: shipEl,
        length: Number(shipEl.dataset.length),
        originalParent: shipEl.parentElement
      };

      selectedDirection = "horizontal";
      isPlacingShip = true;

      // Remove from parent to avoid inherited transforms/positions
      const clone = shipEl.cloneNode(true);
      selectedShip.el = clone;
      selectedShip.originalEl = shipEl;
      
      // Hide original
      shipEl.style.visibility = "hidden";
      
      // Style the clone with minimal interference
      clone.style.cssText = `
        position: fixed;
        opacity: 0.5;
        z-index: 10000;
        pointer-events: none;
        margin: 0;
        padding: 15px 20px;
        display: flex;
        align-items: center;
        gap: 12px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-weight: 600;
        font-size: 1em;
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        cursor: grabbing;
        user-select: none;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
      `;
      
      document.body.appendChild(clone);
      
      showMessage(`Placing ${shipEl.dataset.name}. Click to rotate, double-click to place. ESC to cancel.`, "info");
    });
  });
});

/* =====================================================
   SHIP FOLLOWS CURSOR + PREVIEW
===================================================== */
document.addEventListener("mousemove", e => {
  if (!selectedShip || !isPlacingShip) return;

  // Get actual ship dimensions each time (in case of rotation)
  const rect = selectedShip.el.getBoundingClientRect();
  
  // Position with cursor at center
  selectedShip.el.style.left = (e.clientX - rect.width / 2) + "px";
  selectedShip.el.style.top = (e.clientY - rect.height / 2) + "px";

  // Show preview on player board
  const playerBoardEl = document.querySelector("#player-board");
  const boardRect = playerBoardEl.getBoundingClientRect();
  
  if (e.clientX >= boardRect.left && e.clientX <= boardRect.right &&
      e.clientY >= boardRect.top && e.clientY <= boardRect.bottom) {
    
    const cellEls = playerBoardEl.querySelectorAll(".cell");
    for (const cellEl of cellEls) {
      const cellRect = cellEl.getBoundingClientRect();
      if (e.clientX >= cellRect.left && e.clientX <= cellRect.right &&
          e.clientY >= cellRect.top && e.clientY <= cellRect.bottom) {
        
        const x = Number(cellEl.dataset.x);
        const y = Number(cellEl.dataset.y);
        previewPlacement(x, y, selectedShip.length, selectedDirection, human.board);
        break;
      }
    }
  } else {
    // Clear preview when outside board
    document.querySelectorAll(".cell.preview-valid, .cell.preview-invalid").forEach(el => {
      el.classList.remove("preview-valid", "preview-invalid");
    });
  }
});

/* =====================================================
   ROTATE SHIP ON CLICK
===================================================== */
let clickTimer = null;
document.querySelector("#player-board").addEventListener("click", e => {
  if (!selectedShip || !isPlacingShip) return;
  if (!e.target.classList.contains("cell")) return;

  // Clear any existing timer
  clearTimeout(clickTimer);
  
  // Set a timer to rotate only if double-click doesn't happen
  clickTimer = setTimeout(() => {
    selectedDirection =
      selectedDirection === "horizontal" ? "vertical" : "horizontal";

    selectedShip.el.style.transform =
      selectedDirection === "horizontal"
        ? "rotate(0deg)"
        : "rotate(90deg)";
    
    // Update preview immediately
    const x = Number(e.target.dataset.x);
    const y = Number(e.target.dataset.y);
    previewPlacement(x, y, selectedShip.length, selectedDirection, human.board);
  }, 200);
});

/* =====================================================
   PLACE SHIP ON DOUBLE CLICK
===================================================== */
document.querySelector("#player-board").addEventListener("dblclick", e => {
  if (!selectedShip || !isPlacingShip) return;
  if (!e.target.classList.contains("cell")) return;

  // Clear the click timer to prevent rotation
  clearTimeout(clickTimer);

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
    showMessage("Invalid placement! Try another location.", "warning");
    return;
  }

  // Mark ship as placed
  const shipData = requiredShips.find(s => s.length === selectedShip.length && !s.placed);
  if (shipData) {
    shipData.placed = true;
    shipData.ship = ship;
  }

  // Remove both the clone and the original ship element
  selectedShip.el.remove();
  selectedShip.originalEl.remove();
  selectedShip = null;
  isPlacingShip = false;

  // Clear preview
  document.querySelectorAll(".cell.preview-valid, .cell.preview-invalid").forEach(el => {
    el.classList.remove("preview-valid", "preview-invalid");
  });

  renderBoard(human.board, document.querySelector("#player-board"), "Player Board", true);
  updateShipStatus();
  showMessage("Ship placed!", "success");
});

/* =====================================================
   RIGHT-CLICK TO REMOVE PLACED SHIP
===================================================== */
document.querySelector("#player-board").addEventListener("contextmenu", e => {
  e.preventDefault();
  
  if (gameStarted || isPlacingShip) return;
  if (!e.target.classList.contains("cell")) return;

  const x = Number(e.target.dataset.x);
  const y = Number(e.target.dataset.y);
  const cell = human.board.board[x][y];

  if (!cell.ship) return;

  const ship = cell.ship;
  const shipData = requiredShips.find(s => s.ship === ship);
  
  if (shipData) {
    removeShipFromBoard(human.board, ship);
    shipData.placed = false;
    shipData.ship = null;
    
    // Re-create the ship element in the palette
    const palette = document.querySelector("#ship-palette");
    const newShipEl = document.createElement("div");
    newShipEl.className = "ship";
    newShipEl.dataset.name = shipData.name;
    newShipEl.dataset.length = shipData.length;
    
    const icon = document.createElement("span");
    icon.className = "ship-icon";
    // Match the emoji to the ship type
    const emojis = {
      "Carrier": "🚢",
      "Battleship": "⛴️",
      "Cruiser": "🛥️",
      "Submarine": "🚤",
      "Destroyer": "⛵"
    };
    icon.textContent = emojis[shipData.name];
    
    const name = document.createElement("span");
    name.textContent = shipData.name;
    
    newShipEl.appendChild(icon);
    newShipEl.appendChild(name);
    
    // Add click listener to the new ship element
    newShipEl.addEventListener("click", () => {
      if (isPlacingShip || gameStarted) return;

      selectedShip = {
        el: newShipEl,
        length: Number(newShipEl.dataset.length),
        originalParent: newShipEl.parentElement
      };

      selectedDirection = "horizontal";
      isPlacingShip = true;

      // Remove from parent to avoid inherited transforms/positions
      const clone = newShipEl.cloneNode(true);
      selectedShip.el = clone;
      selectedShip.originalEl = newShipEl;
      
      // Hide original
      newShipEl.style.visibility = "hidden";
      
      // Style the clone with minimal interference
      clone.style.cssText = `
        position: fixed;
        opacity: 0.5;
        z-index: 10000;
        pointer-events: none;
        margin: 0;
        padding: 15px 20px;
        display: flex;
        align-items: center;
        gap: 12px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-weight: 600;
        font-size: 1em;
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        cursor: grabbing;
        user-select: none;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
      `;
      
      document.body.appendChild(clone);
      
      showMessage(`Placing ${newShipEl.dataset.name}. Click to rotate, double-click to place. ESC to cancel.`, "info");
    });
    
    palette.appendChild(newShipEl);
    
    renderBoard(human.board, document.querySelector("#player-board"), "Player Board", true);
    updateShipStatus();
    showMessage(`${shipData.name} removed. Click to place it again.`, "info");
  }
});

/* =====================================================
   CANCEL PLACEMENT (ESC key)
===================================================== */
function cancelPlacement() {
  if (!selectedShip) return;

  selectedShip.el.remove();
  selectedShip.originalEl.style.visibility = "";

  // Clear preview
  document.querySelectorAll(".cell.preview-valid, .cell.preview-invalid").forEach(el => {
    el.classList.remove("preview-valid", "preview-invalid");
  });

  selectedShip = null;
  isPlacingShip = false;
  showMessage("Placement cancelled.", "info");
}

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    cancelPlacement();
  }
});

/* =====================================================
   START GAME BUTTON
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.querySelector("#start-game");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      const allPlaced = requiredShips.every(s => s.placed);
      
      if (!allPlaced) {
        showMessage("Place all ships before starting!", "warning");
        return;
      }

      placeRandomShips(computer.board);
      renderBoard(computer.board, document.querySelector("#computer-board"), "Computer Board");
      
      gameStarted = true;
      document.querySelector("#setup-panel")?.style.setProperty("display", "none");
      showMessage("Game started! Attack the computer's board.", "success");
    });
  }
});

/* =====================================================
   INITIALIZE GAME
===================================================== */
const human = new Player("Cory");
const computer = new Player("CPU", "computer");

renderBoard(human.board, document.querySelector("#player-board"), "Player Board", true);
renderBoard(computer.board, document.querySelector("#computer-board"), "Computer Board");

addCellListeners(computer.board, human.board, computer.board);
updateShipStatus();

// Add initial instructions
showMessage("Click on ships to place them. Right-click placed ships to remove.", "info");