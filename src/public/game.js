// Game Page Logic
let selectedPlayers = new Set();
let allPlayers = [];

async function loadGamePlayers() {
  const container = document.getElementById("playersList");
  const emptyStateEl = document.getElementById("emptyState");

  if (!container) return;

  try {
    const resp = await fetch("/players");
    if (!resp.ok) return;

    allPlayers = await resp.json();
    container.innerHTML = "";

    if (allPlayers.length === 0) {
      if (emptyStateEl) emptyStateEl.style.display = "block";
      return;
    }

    if (emptyStateEl) emptyStateEl.style.display = "none";

    allPlayers.forEach((player) => {
      const playerName = typeof player === "string" ? player : player.name;
      const playerScore = typeof player === "object" ? player.score : 0;

      const card = document.createElement("div");
      card.className = "player-card";
      card.dataset.name = playerName;

      const header = document.createElement("div");
      header.className = "player-header";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "player-checkbox";
      checkbox.addEventListener("change", (e) => {
        e.stopPropagation();
        togglePlayer(playerName, checkbox.checked);
      });

      const nameDiv = document.createElement("div");
      nameDiv.className = "player-name";
      nameDiv.textContent = playerName;

      header.appendChild(checkbox);
      header.appendChild(nameDiv);

      const scoreDiv = document.createElement("div");
      scoreDiv.className = "player-score";
      scoreDiv.textContent = playerScore;

      header.appendChild(scoreDiv);
      card.appendChild(header);

      // Click card to select/deselect
      card.addEventListener("click", () => {
        checkbox.checked = !checkbox.checked;
        togglePlayer(playerName, checkbox.checked);
      });

      container.appendChild(card);
    });

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

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  loadGamePlayers();

  const addPlayerBtn = document.getElementById("addPlayerBtn");
  if (addPlayerBtn) {
    addPlayerBtn.addEventListener("click", () => {
      window.location.href = "/enterNames";
    });
  }

  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "/";
    });
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
