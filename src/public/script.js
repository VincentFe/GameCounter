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
  } else {
    loadPlayers();
  }
});


//
// HOME PAGE BUTTON: Enter Players
//
const startBtn = document.getElementById("startGameBtn");
if (startBtn) {
  startBtn.addEventListener("click", () => {
    window.location.href = "/game";
  });
}

// NEW: Delete Players (show per-player delete buttons when clicked)
const deletePlayersBtn = document.getElementById("deletePlayersBtn");

if (deletePlayersBtn) {
  deletePlayersBtn.addEventListener("click", () => {
    window.location.href = "/enterNames";
  });
}

//
// ENTER NAMES PAGE
//
const createBtn = document.getElementById("createBtn");
const cancelBtn = document.getElementById("cancelBtn");
const nameInput = document.getElementById("playerName");
const statusDiv = document.getElementById("status");

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
