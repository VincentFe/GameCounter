// Chinees Poepeke Game Page Logic
let allPlayers = [];
let addingNewPlayer = false;
let roundNumber = 1;
// Track selected buttons for chinees poepeke: { playerName: "gehaald" | "gefaald" | null }
let chineesButtonStates = {};

function updateRoundValidity() {
  const textboxes = document.querySelectorAll(".chinees-input");
  let sumOfValues = 0;
  textboxes.forEach((box) => {
    sumOfValues += parseInt(box.value || "0", 10);
  });
  const isValid = sumOfValues !== roundNumber;
  const geldidIndicator = document.getElementById("geldidIndicator");
  const overUnderBox = document.getElementById("overUnderBox");
  // Update Over/Under display
  if (!overUnderBox) {
    console.warn('Missing #overUnderBox element');
  } else {
    if (sumOfValues < roundNumber) {
      overUnderBox.textContent = `Onder: ${roundNumber - sumOfValues}`;
      overUnderBox.style.opacity = "1";
      overUnderBox.style.pointerEvents = "auto";
    } else if (sumOfValues > roundNumber) {
      overUnderBox.textContent = `Over: ${sumOfValues - roundNumber}`;
      overUnderBox.style.opacity = "1";
      overUnderBox.style.pointerEvents = "auto";
    } else {
      // sum equals roundNumber: grey out
      overUnderBox.textContent = "Over/Under: -";
      overUnderBox.style.opacity = "0.45";
      overUnderBox.style.pointerEvents = "none";
    }
  }
  if (isValid) {
    geldidIndicator.textContent = "Geldig: ✅";
    geldidIndicator.classList.add("valid");
    document.querySelectorAll(".chinees-btn").forEach((btn) => {
      btn.disabled = false;
      btn.style.opacity = "0.7";
      btn.style.cursor = "pointer";
    });
  } else {
    geldidIndicator.textContent = "Geldig: ❌";
    geldidIndicator.classList.remove("valid");
    document.querySelectorAll(".chinees-btn").forEach((btn) => {
      btn.disabled = true;
      btn.style.opacity = "0.3";
      btn.style.cursor = "not-allowed";
    });
  }
}

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

async function loadGamePlayers() {
  const container = document.getElementById("playersList");
  const emptyStateEl = document.getElementById("emptyState");

  if (!container) return;

  // Reset chinees button states when reloading
  chineesButtonStates = {};

  try {
    const resp = await fetch("/players");
    if (!resp.ok) return;

    allPlayers = await resp.json();
    container.innerHTML = "";

    // Update game title in header
    try {
      const gameResp = await fetch("/getGameName");
      if (gameResp.ok) {
        const gameData = await gameResp.json();
        const titleEl = document.getElementById("gameTitle");
        if (titleEl) {
          titleEl.textContent = gameData.name || "Chinees Poepeke";
        }
      }
    } catch (e) {
      // Silently fail - use default title
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

      // Subtract button (left side)
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

      row.appendChild(card);

      // Add button (right side)
      const addBtn = document.createElement("button");
      addBtn.className = "player-btn";
      addBtn.textContent = "+";
      addBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        updatePlayerScoreDirect(playerName, 1);
      });
      row.appendChild(addBtn);

      // Chinees Poepeke mode: add input field and buttons
      const actions = document.createElement("div");
      actions.className = "chinees-actions";

      // Gefaald button
      const gefaaldBtn = document.createElement("button");
      gefaaldBtn.className = "chinees-btn chinees-btn-gefaald";
      gefaaldBtn.textContent = "Gefaald";
      gefaaldBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleChineesButton(playerName, "gefaald", gefaaldBtn, gehaalBtn);
      });

      // Input field
      const input = document.createElement("input");
      input.type = "number";
      input.className = "chinees-input";
      input.placeholder = "0";
        input.min = "0";
        input.value = "0";
        input.addEventListener("change", updateRoundValidity);
        input.addEventListener("input", updateRoundValidity);

      // Gehaald button
      const gehaalBtn = document.createElement("button");
      gehaalBtn.className = "chinees-btn chinees-btn-gehaald";
      gehaalBtn.textContent = "Gehaald";
      gehaalBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleChineesButton(playerName, "gehaald", gehaalBtn, gefaaldBtn);
      });

      actions.appendChild(gefaaldBtn);
      actions.appendChild(input);
      actions.appendChild(gehaalBtn);
      row.appendChild(actions);

      container.appendChild(row);
    });
  } catch (e) {
    console.error("Error loading game players:", e);
  }
}

function toggleChineesButton(playerName, buttonType, selectedBtn, otherBtn) {
  const currentState = chineesButtonStates[playerName];
  
  if (currentState === buttonType) {
    // Deselect if already selected
    chineesButtonStates[playerName] = null;
    selectedBtn.classList.remove("selected");
  } else {
    // Select this button and deselect the other
    chineesButtonStates[playerName] = buttonType;
    selectedBtn.classList.add("selected");
    otherBtn.classList.remove("selected");
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

async function validateRound() {
  // Check if all players have either gehaald or gefaald selected
  for (const player of allPlayers) {
    const playerName = typeof player === "string" ? player : player.name;
    if (!chineesButtonStates[playerName]) {
      alert(`Player "${playerName}" must have either Gehaald or Gefaald selected.`);
      return;
    }
  }

  // Get all the textbox values and process scores
  const playerElements = document.querySelectorAll(".player-row");
  const updates = [];

  playerElements.forEach((row) => {
    const card = row.querySelector(".player-card");
    if (!card) return;

    const playerName = card.dataset.name;
    const buttonState = chineesButtonStates[playerName];
    const input = row.querySelector(".chinees-input");
    const inputValue = parseInt(input.value || "0", 10);

    if (!buttonState) return;

    let scoreChange = 0;
    if (buttonState === "gehaald") {
      scoreChange = 10 + inputValue;
    } else if (buttonState === "gefaald") {
      scoreChange = -inputValue;
    }

    updates.push({ playerName, scoreChange, inputElement: input });
  });

  // Apply all score updates
  try {
    const promises = updates.map(({ playerName, scoreChange }) =>
      fetch("/updateScore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: playerName, score: scoreChange }),
      })
    );

    const results = await Promise.all(promises);
    const allOk = results.every((r) => r.ok);

    if (allOk) {
      // Increment round number
      roundNumber++;
      const roundCounter = document.getElementById("roundCounter");
      if (roundCounter) {
        roundCounter.textContent = `Ronde: ${roundNumber}`;
      }

      // Reset all textboxes to 0 and deselect all buttons
      updates.forEach(({ inputElement }) => {
        inputElement.value = "0";
      });

      // Reset button states
      chineesButtonStates = {};
      const gefaaldBtns = document.querySelectorAll(".chinees-btn-gefaald");
      const gehaalBtns = document.querySelectorAll(".chinees-btn-gehaald");
      gefaaldBtns.forEach((btn) => btn.classList.remove("selected"));
      gehaalBtns.forEach((btn) => btn.classList.remove("selected"));

      // Show success message
      const statusEl = document.getElementById("statusMessage");
      statusEl.textContent = "✅ Round validated and scores updated!";
      statusEl.classList.add("success");
      statusEl.classList.remove("error");
      statusEl.style.display = "block";

      // Reload to show updated scores
      await loadGamePlayers();

      // Clear status message after 3 seconds
      setTimeout(() => {
        statusEl.style.display = "none";
      }, 3000);
    } else {
      const statusEl = document.getElementById("statusMessage");
      statusEl.textContent = "❌ Failed to update some scores";
      statusEl.classList.add("error");
      statusEl.classList.remove("success");
      statusEl.style.display = "block";
    }
  } catch (e) {
    console.error("Error validating round:", e);
    const statusEl = document.getElementById("statusMessage");
    statusEl.textContent = `❌ Error: ${e.message}`;
    statusEl.classList.add("error");
    statusEl.classList.remove("success");
    statusEl.style.display = "block";
  }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", async () => {
  await loadGamePlayers();
  updateRoundValidity();

  const addPlayerBtn = document.getElementById("addPlayerBtn");
  if (addPlayerBtn) {
    addPlayerBtn.addEventListener("click", addNewPlayerEntry);
  }

  const validateRoundBtn = document.getElementById("validateRoundBtn");
  if (validateRoundBtn) {
    validateRoundBtn.addEventListener("click", () => {
      validateRound();
    });
  }

  const saveGameBtn = document.getElementById("saveGameBtn");
  if (saveGameBtn) {
    saveGameBtn.addEventListener("click", saveGame);
  }
});
