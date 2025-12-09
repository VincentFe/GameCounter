async function loadPlayers() {
  const listEl = document.getElementById("playerList");

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
    players.forEach(player => {
      const li = document.createElement("li");
      li.textContent = player;
      listEl.appendChild(li);
    });

  } catch (e) {
    console.error("Error loading players:", e);
  }
}

// Call once at page load
window.addEventListener("DOMContentLoaded", loadPlayers);


//
// HOME PAGE BUTTON: Enter Players
//
const startBtn = document.getElementById("startGameBtn");
if (startBtn) {
  startBtn.addEventListener("click", () => {
    window.location.href = "/enterNames";
  });
}

// NEW: Delete Players (show per-player delete buttons when clicked)
const deletePlayersBtn = document.getElementById("deletePlayersBtn");
let showingDeleteButtons = false;

async function addPerPlayerDeleteButtons() {
  const listEl = document.getElementById("playerList");
  if (!listEl) return;

  // Clear and reload players with delete buttons
  try {
    const resp = await fetch("/players");
    if (!resp.ok) return;
    const players = await resp.json();

    listEl.innerHTML = "";
    players.forEach(player => {
      const li = document.createElement("li");
      li.style.display = "flex";
      li.style.gap = "8px";
      li.style.alignItems = "center";

      const nameSpan = document.createElement("span");
      nameSpan.textContent = player;
      li.appendChild(nameSpan);

      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.type = "button";
      delBtn.dataset.name = player;
      delBtn.addEventListener("click", async (e) => {
        delBtn.disabled = true;
        try {
          const r = await fetch('/deletePlayer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: player })
          });
          const data = await r.json();
          if (r.ok && data.ok) {
            // remove li from DOM
            li.remove();
          } else {
            alert('Failed to delete: ' + (data?.error || r.statusText));
          }
        } catch (err) {
          alert('Network error: ' + err.message);
        } finally {
          delBtn.disabled = false;
        }
      });

      li.appendChild(delBtn);
      listEl.appendChild(li);
    });

  } catch (err) {
    console.error('Error loading players for deletion', err);
  }
}

if (deletePlayersBtn) {
  deletePlayersBtn.addEventListener('click', async () => {
    showingDeleteButtons = !showingDeleteButtons;
    deletePlayersBtn.textContent = showingDeleteButtons ? 'Hide Delete Buttons' : 'Delete Players';

    if (showingDeleteButtons) {
      await addPerPlayerDeleteButtons();
    } else {
      // simply reload normal list
      loadPlayers();
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

if (createBtn) {
  createBtn.addEventListener("click", async () => {
    const name = (nameInput?.value || "").trim();
    if (!name) {
      alert("Please enter a name.");
      nameInput?.focus();
      return;
    }

    createBtn.disabled = true;
    statusDiv.textContent = "Saving...";

    try {
      const resp = await fetch("/saveName", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });

      const data = await resp.json();

      if (resp.ok && data.ok) {
        statusDiv.textContent = `Saved "${name}".`;
        nameInput.value = "";
        nameInput.focus();

        // refresh player list after adding a new name
        loadPlayers();

      } else {
        statusDiv.textContent = `Error: ${data?.error || resp.statusText}`;
      }
    } catch (e) {
      statusDiv.textContent = `Network error: ${e.message}`;
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
