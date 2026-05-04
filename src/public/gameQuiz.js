// Quiz Game Page Logic
let selectedPlayers = new Set();
let allPlayers = [];
let addingNewPlayer = false;

async function saveGame() {
  try {
    const resp = await fetch("/saveGame", { method: "POST" });
    if (resp.ok) {
      window.location.href = "/";
    } else {
      alert("Failed to save game");
    }
  } catch (e) {
    console.error("Error saving game:", e);
    alert("Error saving game");
  }
}

function addNewPlayerEntry() {
  if (addingNewPlayer) {
    alert("Please finish adding the current player first.");
    return;
  }

  addingNewPlayer = true;
  const container = document.getElementById("playersList");
  
  // Create new player entry container with white background
  const newEntry = document.createElement("div");
  newEntry.className = "new-player-entry";
  newEntry.id = "newPlayerEntry";

  // Create input for player name
  const input = document.createElement("input");
  input.type = "text";
  input.className = "new-player-input";
  input.placeholder = "Enter player name...";
  input.autocomplete = "off";

  // Create buttons container
  const buttonsDiv = document.createElement("div");
  buttonsDiv.className = "new-player-buttons";

  // Create Add button
  const addBtn = document.createElement("button");
  addBtn.className = "new-player-add-btn";
  addBtn.textContent = "Add";
  addBtn.addEventListener("click", async () => {
    const playerName = input.value.trim();
    if (!playerName) {
      alert("Please enter a player name.");
      input.focus();
      return;
    }

    addBtn.disabled = true;

    try {
      const resp = await fetch("/addPlayer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: playerName }),
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.ok) {
          // Remove the new entry and reload all players
          newEntry.remove();
          addingNewPlayer = false;
          loadGamePlayers();
        } else {
          alert(data.error || "Failed to add player");
          addBtn.disabled = false;
        }
      } else {
        const data = await resp.json();
        alert(data.error || "Failed to add player");
        addBtn.disabled = false;
      }
    } catch (e) {
      console.error("Error adding player:", e);
      alert("Error adding player");
      addBtn.disabled = false;
    }
  });

  // Create Cancel button
  const cancelBtn = document.createElement("button");
  cancelBtn.className = "new-player-cancel-btn";
  cancelBtn.textContent = "Cancel";
  cancelBtn.addEventListener("click", () => {
    newEntry.remove();
    addingNewPlayer = false;
  });

  buttonsDiv.appendChild(addBtn);
  buttonsDiv.appendChild(cancelBtn);

  newEntry.appendChild(input);
  newEntry.appendChild(buttonsDiv);
  container.appendChild(newEntry);
  
  // Focus on the input
  input.focus();
}

async function endGame() {
  try {
    const resp = await fetch("/markGameInactive", { method: "POST" });
    if (resp.ok) {
      window.location.href = "/leaderboard";
    } else {
      alert("Failed to end game");
    }
  } catch (e) {
    console.error("Error ending game:", e);
    alert("Error ending game");
  }
}

async function logout() {
  try {
    await fetch("/logout", { method: "POST" });
    window.location.href = "/login";
  } catch (e) {
    console.error("Error logging out:", e);
    window.location.href = "/login";
  }
}

async function loadGamePlayers() {
  const container = document.getElementById("playersList");
  const emptyStateEl = document.getElementById("emptyState");

  if (!container) return;

  try {
    const resp = await fetch("/players");
    if (!resp.ok) return;

    allPlayers = await resp.json();
    container.innerHTML = "";

    // Update game title in header
    if (allPlayers.length > 0 || true) {
      try {
        const gameResp = await fetch("/getGameName");
        if (gameResp.ok) {
          const gameData = await gameResp.json();
          const titleEl = document.getElementById("gameTitle");
          if (titleEl) {
            titleEl.textContent = gameData.name || "Quiz Game";
          }
        }
      } catch (e) {
        // Silently fail - use default title
      }
    }

    if (allPlayers.length === 0) {
      if (emptyStateEl) emptyStateEl.style.display = "block";
      return;
    }

    if (emptyStateEl) emptyStateEl.style.display = "none";

    allPlayers.forEach((player) => {
      const playerName = typeof player === "string" ? player : player.name;
      const playerScore = typeof player === "object" ? player.score : 0;

      // Create row container
      const row = document.createElement("div");
      row.className = "player-row";

      // Subtract button (outside, left)
      const subtractBtn = document.createElement("button");
      subtractBtn.className = "player-btn";
      subtractBtn.textContent = "-";
      subtractBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        updatePlayerScoreDirect(playerName, -1);
      });
      row.appendChild(subtractBtn);

      // Player card
      const card = document.createElement("div");
      card.className = "player-card";
      card.dataset.name = playerName;

      const header = document.createElement("div");
      header.className = "player-header";

      const nameDiv = document.createElement("div");
      nameDiv.className = "player-name";
      nameDiv.textContent = playerName;

      header.appendChild(nameDiv);

      const scoreDiv = document.createElement("div");
      scoreDiv.className = "player-score";
      scoreDiv.textContent = playerScore;

      header.appendChild(scoreDiv);
      card.appendChild(header);

      // Click card to select/deselect
      card.addEventListener("click", () => {
        const isCurrentlySelected = selectedPlayers.has(playerName);
        togglePlayer(playerName, !isCurrentlySelected);
      });

      // Make card draggable
      card.draggable = true;
      card.addEventListener("dragstart", handleDragStart);
      card.addEventListener("dragend", handleDragEnd);

      row.appendChild(card);

      // Add button
      const addBtn = document.createElement("button");
      addBtn.className = "player-btn";
      addBtn.textContent = "+";
      addBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        updatePlayerScoreDirect(playerName, 1);
      });
      row.appendChild(addBtn);

      container.appendChild(row);
    });

    // Add drag-and-drop event listeners to container
    container.addEventListener("dragover", handleDragOver);
    container.addEventListener("drop", handleDrop);
    container.addEventListener("dragleave", handleDragLeave);

    updateScoreUpdateSection();
  } catch (e) {
    console.error("Error loading game players:", e);
  }
}

function togglePlayer(name, selected) {
  if (selected) {
    selectedPlayers.add(name);
  } else {
    selectedPlayers.delete(name);
  }

  // Update UI
  const cards = document.querySelectorAll(".player-card");
  cards.forEach((card) => {
    if (selectedPlayers.has(card.dataset.name)) {
      card.classList.add("selected");
    } else {
      card.classList.remove("selected");
    }
  });

  updateSelectedPlayersList();
  updateScoreUpdateSection();
}

function updateSelectedPlayersList() {
  const listEl = document.getElementById("selectedPlayersList");
  listEl.innerHTML = "";

  if (selectedPlayers.size === 0) {
    listEl.innerHTML = '<p style="color: #999;">No players selected</p>';
    return;
  }

  selectedPlayers.forEach((name) => {
    const tag = document.createElement("div");
    tag.className = "player-tag";
    tag.textContent = name;
    listEl.appendChild(tag);
  });
}

function updateScoreUpdateSection() {
  const section = document.getElementById("scoreUpdateSection");
  if (section) {
    section.style.display = selectedPlayers.size > 0 ? "block" : "none";
  }
}

async function updatePlayerScoreDirect(playerName, points) {
  try {
    const resp = await fetch("/updateScore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: playerName, score: points }),
    });

    if (resp.ok) {
      loadGamePlayers();
    } else {
      const errorData = await resp.json();
      console.error("Score update failed:", errorData);
      alert("Failed to update score");
    }
  } catch (e) {
    console.error("Error updating score:", e);
    alert("Error updating score");
  }
}

async function updateScores(operation) {
  if (selectedPlayers.size === 0) {
    alert("Please select at least one player");
    return;
  }

  const amountInput = document.getElementById("scoreAmount");
  const amount = parseInt(amountInput.value || "0", 10);

  if (isNaN(amount)) {
    alert("Please enter a valid number");
    return;
  }

  if (operation === "subtract") {
    // Negate the amount for subtraction
    updateScoresForPlayers(-amount);
  } else if (operation === "add") {
    updateScoresForPlayers(amount);
  } else if (operation === "set") {
    setScoresForPlayers(amount);
  }
}

async function updateScoresForPlayers(amount) {
  const statusEl = document.getElementById("statusMessage");
  const buttons = document.querySelectorAll("#addScoreBtn, #subtractScoreBtn");
  buttons.forEach((btn) => (btn.disabled = true));

  try {
    const promises = Array.from(selectedPlayers).map((playerName) =>
      fetch("/updateScore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: playerName, score: amount }),
      })
    );

    const results = await Promise.all(promises);
    const allOk = results.every((r) => r.ok);

    if (allOk) {
      statusEl.textContent = `✅ Scores updated for ${selectedPlayers.size} player(s)!`;
      statusEl.classList.add("success");
      statusEl.classList.remove("error");

      // Reload players to show updated scores
      await loadGamePlayers();
      selectedPlayers.clear();
      updateSelectedPlayersList();
      updateScoreUpdateSection();
    } else {
      statusEl.textContent = "❌ Failed to update some scores";
      statusEl.classList.add("error");
      statusEl.classList.remove("success");
    }
  } catch (e) {
    statusEl.textContent = `❌ Error: ${e.message}`;
    statusEl.classList.add("error");
    statusEl.classList.remove("success");
  } finally {
    buttons.forEach((btn) => (btn.disabled = false));
  }
}

async function setScoresForPlayers(amount) {
  const statusEl = document.getElementById("statusMessage");
  const buttons = document.querySelectorAll("#setScoreBtn");
  buttons.forEach((btn) => (btn.disabled = true));

  try {
    const promises = Array.from(selectedPlayers).map((playerName) =>
      fetch("/setScore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: playerName, score: amount }),
      })
    );

    const results = await Promise.all(promises);
    const allOk = results.every((r) => r.ok);

    if (allOk) {
      statusEl.textContent = `✅ Scores set to ${amount} for ${selectedPlayers.size} player(s)!`;
      statusEl.classList.add("success");
      statusEl.classList.remove("error");

      // Reload players to show updated scores
      await loadGamePlayers();
      selectedPlayers.clear();
      updateSelectedPlayersList();
      updateScoreUpdateSection();
    } else {
      statusEl.textContent = "❌ Failed to set some scores";
      statusEl.classList.add("error");
      statusEl.classList.remove("success");
    }
  } catch (e) {
    statusEl.textContent = `❌ Error: ${e.message}`;
    statusEl.classList.add("error");
    statusEl.classList.remove("success");
  } finally {
    buttons.forEach((btn) => (btn.disabled = false));
  }
}

// Drag and Drop functionality
let draggedElement = null;

function handleDragStart(e) {
  draggedElement = e.target;
  draggedElement.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/html", draggedElement.outerHTML);
}

function handleDragEnd(e) {
  if (draggedElement) {
    draggedElement.classList.remove("dragging");
    draggedElement = null;
  }
  // Remove drag-over class from all elements
  document.querySelectorAll(".player-card.drag-over").forEach(el => el.classList.remove("drag-over"));
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";

  const target = e.target.closest(".player-card");
  if (target && target !== draggedElement) {
    // Remove previous drag-over
    document.querySelectorAll(".player-card.drag-over").forEach(el => el.classList.remove("drag-over"));
    target.classList.add("drag-over");
  }
}

function handleDragLeave(e) {
  const target = e.target.closest(".player-card");
  if (target) {
    target.classList.remove("drag-over");
  }
}

async function handleDrop(e) {
  e.preventDefault();

  const target = e.target.closest(".player-card");
  if (!target || !draggedElement || target === draggedElement) {
    handleDragEnd(e);
    return;
  }

  // Reorder DOM
  const container = document.getElementById("playersList");
  const draggedRow = draggedElement.closest(".player-row");
  const targetRow = target.closest(".player-row");

  const allRows = Array.from(container.children);
  const draggedIndex = allRows.indexOf(draggedRow);
  const targetIndex = allRows.indexOf(targetRow);

  if (draggedIndex < targetIndex) {
    container.insertBefore(draggedRow, targetRow.nextSibling);
  } else {
    container.insertBefore(draggedRow, targetRow);
  }

  // Get new order of names
  const newOrder = Array.from(document.querySelectorAll(".player-card")).map(card => card.dataset.name);

  // Send to server
  try {
    const resp = await fetch("/reorderPlayers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newOrder })
    });
    if (!resp.ok) {
      console.error("Failed to reorder players");
      // Reload to revert
      loadGamePlayers();
    }
  } catch (err) {
    console.error("Error reordering players:", err);
    loadGamePlayers();
  }

  handleDragEnd(e);
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  loadGamePlayers();

  const addPlayerBtn = document.getElementById("addPlayerBtn");
  if (addPlayerBtn) {
    addPlayerBtn.addEventListener("click", addNewPlayerEntry);
  }

  const saveGameBtn = document.getElementById("saveGameBtn");
  if (saveGameBtn) {
    saveGameBtn.addEventListener("click", saveGame);
  }

  const addScoreBtn = document.getElementById("addScoreBtn");
  if (addScoreBtn) {
    addScoreBtn.addEventListener("click", () => updateScores("add"));
  }

  const subtractScoreBtn = document.getElementById("subtractScoreBtn");
  if (subtractScoreBtn) {
    subtractScoreBtn.addEventListener("click", () => updateScores("subtract"));
  }

  const setScoreBtn = document.getElementById("setScoreBtn");
  if (setScoreBtn) {
    setScoreBtn.addEventListener("click", () => updateScores("set"));
  }

  // Allow Enter key to submit score update
  const scoreAmount = document.getElementById("scoreAmount");
  if (scoreAmount) {
    scoreAmount.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        updateScores("add");
      }
    });
  }
});
