async function loadPlayers() {
  const listEl = document.getElementById("playerList");
  const emptyStateEl = document.getElementById("emptyState");

  if (!listEl) {
    console.warn("playerList not found on this page");
    return;
  }

  try {
    const resp = await fetch("/players");

    // If server cannot find /players, fail loudly
    if (!resp.ok) {
      console.error("Failed to fetch /players", resp.status);
      return;
    }

    const players = await resp.json();

    listEl.innerHTML = "";
    
    if (players.length === 0) {
      if (emptyStateEl) emptyStateEl.style.display = "block";
      return;
    }
    
    if (emptyStateEl) emptyStateEl.style.display = "none";

    players.forEach((player) => {
      const li = document.createElement("li");
      li.className = "player-item";
      
      const playerInfo = document.createElement("div");
      playerInfo.className = "player-info";
      
      const nameDiv = document.createElement("div");
      nameDiv.className = "player-name";
      nameDiv.textContent = typeof player === "string" ? player : player.name;
      playerInfo.appendChild(nameDiv);
      
      const score = typeof player === "object" ? player.score : 0;
      const scoreDiv = document.createElement("div");
      scoreDiv.className = "player-score";
      scoreDiv.textContent = `Score: ${score || 0} points`;
      playerInfo.appendChild(scoreDiv);
      
      li.appendChild(playerInfo);
      listEl.appendChild(li);
    });

  } catch (e) {
    console.error("Error loading players:", e);
  }
}

// Manage Players loader (names only)
async function loadManagePlayers() {
  const listEl = document.getElementById("playerList");
  const emptyStateEl = document.getElementById("emptyState");

  if (!listEl) return;

  try {
    const resp = await fetch("/playerNames");
    if (!resp.ok) return;
    const players = await resp.json();

    listEl.innerHTML = "";
    if (players.length === 0) {
      if (emptyStateEl) emptyStateEl.style.display = "block";
      return;
    }
    if (emptyStateEl) emptyStateEl.style.display = "none";

    players.forEach((player) => {
      const li = document.createElement("li");
      li.className = "player-item";
      li.style.display = "flex";
      li.style.justifyContent = "space-between";
      li.style.alignItems = "center";

      const nameSpan = document.createElement("span");
      nameSpan.textContent = player;
      li.appendChild(nameSpan);

      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.type = "button";
      delBtn.className = "btn-delete btn-sm";
      delBtn.dataset.name = player;
      delBtn.addEventListener("click", async () => {
        delBtn.disabled = true;
        try {
          const r = await fetch("/deletePlayer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: player }),
          });
          const data = await r.json();
          if (r.ok && data.ok) {
            li.remove();
            // also update home/game lists if present
            if (typeof loadPlayers === "function") loadPlayers();
            if (typeof loadGamePlayers === "function") loadGamePlayers();
          } else {
            alert("Failed to delete: " + (data?.error || r.statusText));
          }
        } catch (err) {
          alert("Network error: " + err.message);
        } finally {
          delBtn.disabled = false;
        }
      });

      li.appendChild(delBtn);
      listEl.appendChild(li);
    });
  } catch (e) {
    console.error("Error loading manage players:", e);
  }
}

// Call appropriate loader on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("nameForm")) {
    loadManagePlayers();
  } else if (window.location.pathname === "/game") {
    if (typeof loadGamePlayers === "function") loadGamePlayers();
  }
  // Note: home page no longer loads players list
});


// HOME / ENTER NAMES START BUTTON: navigate according to page
const startBtn = document.getElementById("startGameBtn");
if (startBtn) {
  startBtn.addEventListener("click", () => {
    const path = window.location.pathname;
    if (path === "/" || path === "") {
      // from home -> go to enter names
      window.location.href = "/enterNames";
    } else if (path === "/enterNames" || path.startsWith("/enterNames")) {
      // from enter names -> start game
      // only proceed if there are players; otherwise warn
      fetch('/playerNames')
        .then(r => r.ok ? r.json() : [])
        .then(list => {
          if (!list || list.length === 0) {
            alert('Please add at least one player before starting the game.');
            return;
          }
          window.location.href = "/game";
        })
        .catch(() => window.location.href = "/game");
    } else {
      // fallback
      window.location.href = "/enterNames";
    }
  });
}

// NEW: Load Game (show modal with saved games)
const loadGameBtn = document.getElementById("loadGameBtn");
if (loadGameBtn) {
  loadGameBtn.addEventListener("click", async () => {
    openGameSelection();
  });
}

let selectedGame = null;

async function openGameSelection() {
  const modal = document.getElementById("gameSelectionModal");
  const gamesList = document.getElementById("gamesList");
  const noGamesState = document.getElementById("noGamesState");
  const continueGameBtn = document.getElementById("continueGameBtn");

  if (!modal) return;

  modal.style.display = "flex";

  try {
    const resp = await fetch("/listGames");
    const games = resp.ok ? await resp.json() : [];

    gamesList.innerHTML = "";
    selectedGame = null;
    continueGameBtn.disabled = true;

    if (games.length === 0) {
      noGamesState.style.display = "block";
      gamesList.style.display = "none";
      return;
    }

    noGamesState.style.display = "none";
    gamesList.style.display = "flex";

    games.forEach((gameName) => {
      const item = document.createElement("div");
      item.className = "game-item";

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.className = "game-radio";
      radio.name = "game-selection";
      radio.value = gameName;
      radio.addEventListener("change", () => {
        selectedGame = gameName;
        continueGameBtn.disabled = false;
        // Update UI: mark selected
        document.querySelectorAll(".game-item").forEach((el) => {
          el.classList.remove("selected");
        });
        item.classList.add("selected");
      });

      const label = document.createElement("label");
      label.className = "game-name";
      label.textContent = gameName;
      label.style.cursor = "pointer";
      label.style.flex = "1";
      label.addEventListener("click", () => {
        radio.click();
      });

      item.appendChild(radio);
      item.appendChild(label);
      gamesList.appendChild(item);
    });
  } catch (e) {
    console.error("Error loading games:", e);
    noGamesState.style.display = "block";
  }
}

function closeGameSelection() {
  const modal = document.getElementById("gameSelectionModal");
  if (modal) {
    modal.style.display = "none";
  }
}

const continueGameBtn = document.getElementById("continueGameBtn");
if (continueGameBtn) {
  continueGameBtn.addEventListener("click", () => {
    if (selectedGame) {
      window.location.href = `/game?game=${encodeURIComponent(selectedGame)}`;
    } else {
      alert("Please select a game first.");
    }
  });
}

//
// ENTER NAMES PAGE
//
const createBtn = document.getElementById("createBtn");
const cancelBtn = document.getElementById("cancelBtn");
const nameInput = document.getElementById("playerName");
const statusDiv = document.getElementById("status");
const setGameBtn = document.getElementById("setGameBtn");
const gameNameInput = document.getElementById("gameName");

// Game name Set/Edit toggle
let gameNameIsSet = false;

if (setGameBtn) {
  setGameBtn.addEventListener("click", async () => {
    if (!gameNameIsSet) {
      // Set mode: save the game name
      const gameName = (gameNameInput?.value || "").trim();
      if (!gameName) {
        alert("Please enter a game name.");
        gameNameInput?.focus();
        return;
      }

      setGameBtn.disabled = true;
      try {
        const resp = await fetch("/setGameName", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: gameName }),
        });

        const data = await resp.json();
        if (resp.ok && data.ok) {
          // Update UI: disable input, change button to "Edit"
          gameNameIsSet = true;
          gameNameInput.disabled = true;
          setGameBtn.textContent = "Edit";
        } else {
          alert("Failed to set game name: " + (data?.error || resp.statusText));
        }
      } catch (e) {
        alert("Network error: " + e.message);
      } finally {
        setGameBtn.disabled = false;
      }
    } else {
      // Edit mode: enable input, clear it, change button back to "Set"
      gameNameIsSet = false;
      gameNameInput.disabled = false;
      gameNameInput.value = "";
      setGameBtn.textContent = "Set";
      gameNameInput.focus();
    }
  });
}

if (createBtn) {
  createBtn.addEventListener("click", async () => {
    const name = (nameInput?.value || "").trim();
    if (!name) {
      alert("Please enter a name.");
      nameInput?.focus();
      return;
    }

    createBtn.disabled = true;
    if (statusDiv) {
      statusDiv.textContent = "Saving...";
      statusDiv.classList.remove("error");
      statusDiv.classList.add("success");
      statusDiv.style.display = "block";
    }

    try {
      const resp = await fetch("/saveName", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await resp.json();

      if (resp.ok && data.ok) {
        if (statusDiv) {
          statusDiv.textContent = `✅ "${name}" added successfully!`;
          statusDiv.classList.add("success");
          statusDiv.classList.remove("error");
        }
        nameInput.value = "";
        nameInput.focus();

        // refresh appropriate lists after adding a new name
        if (document.getElementById("nameForm")) {
          // on manage page
          loadManagePlayers();
        } else {
          loadPlayers();
        }
      } else {
        if (statusDiv) {
          statusDiv.textContent = `❌ Error: ${data?.error || resp.statusText}`;
          statusDiv.classList.add("error");
          statusDiv.classList.remove("success");
        }
      }
    } catch (e) {
      if (statusDiv) {
        statusDiv.textContent = `❌ Network error: ${e.message}`;
        statusDiv.classList.add("error");
        statusDiv.classList.remove("success");
      }
    } finally {
      createBtn.disabled = false;
    }
  });
}

if (cancelBtn) {
  cancelBtn.addEventListener("click", () => {
    window.location.href = "/";
  });
}
