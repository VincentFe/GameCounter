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
// Delete-selection mode state
window.__deleteMode = false;
window.__selectedToDelete = new Set();

function updateDeleteButtonVisibility() {
  const deleteBtn = document.getElementById("deleteBtn");
  if (!deleteBtn) return;
  deleteBtn.style.display = document.getElementById("playerList")?.children.length > 0 ? "block" : "none";
  // show count when in delete mode
  if (window.__deleteMode) {
    deleteBtn.textContent = window.__selectedToDelete.size > 0 ? `Delete (${window.__selectedToDelete.size})` : "Delete";
  } else {
    deleteBtn.textContent = "Delete";
  }
}

async function performDeletes() {
  if (window.__selectedToDelete.size === 0) return;
  if (!confirm(`Delete ${window.__selectedToDelete.size} selected player(s)?`)) return;

  const names = Array.from(window.__selectedToDelete);
  for (const n of names) {
    try {
      await fetch("/deletePlayer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n }),
      });
    } catch (e) {
      console.warn("Failed to delete", n, e);
    }
  }

  window.__selectedToDelete.clear();
  window.__deleteMode = false;
  removeMasterCheckbox();
  await loadManagePlayers();
  if (typeof loadPlayers === "function") loadPlayers();
  if (typeof loadGamePlayers === "function") loadGamePlayers();
}

function toggleDeleteMode() {
  if (!window.__deleteMode) {
    // enter delete-selection mode
    window.__deleteMode = true;
    window.__selectedToDelete.clear();
    renderMasterCheckbox();
    loadManagePlayers();
    return;
  }

  // if we're already in delete mode
  if (window.__selectedToDelete.size > 0) {
    // confirm & perform deletes
    performDeletes();
  } else {
    // no selection -> just exit delete mode and remove master checkbox
    window.__deleteMode = false;
    removeMasterCheckbox();
    window.__selectedToDelete.clear();
    loadManagePlayers();
  }
}

function renderMasterCheckbox() {
  removeMasterCheckbox();
  const deleteBtn = document.getElementById("deleteBtn");
  if (!deleteBtn) return;
  const wrapper = document.createElement("span");
  wrapper.id = "deleteMasterWrapper";
  wrapper.style.marginLeft = "8px";

  const toggle = document.createElement("div");
  toggle.id = "deleteMasterToggle";
  toggle.className = "select-deselect-toggle";
  toggle.textContent = "Select/Deselect";
  toggle.setAttribute("role", "button");
  toggle.setAttribute("tabindex", "0");
  
  let isSelected = false;
  
  const updateToggleState = () => {
    if (isSelected) {
      toggle.classList.add("selected");
      toggle.classList.remove("unselected");
    } else {
      toggle.classList.add("unselected");
      toggle.classList.remove("selected");
    }
  };
  
  updateToggleState();
  
  toggle.addEventListener("click", () => {
    isSelected = !isSelected;
    const list = document.getElementById("playerList");
    if (!list) return;
    window.__selectedToDelete.clear();
    Array.from(list.children).forEach((li) => {
      if (isSelected) {
        li.classList.add("selected-for-delete");
        const name = li.dataset.name;
        if (name) window.__selectedToDelete.add(name);
      } else {
        li.classList.remove("selected-for-delete");
      }
    });
    updateToggleState();
    updateDeleteButtonVisibility();
  });
  
  toggle.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle.click();
    }
  });

  wrapper.appendChild(toggle);
  deleteBtn.parentNode.insertBefore(wrapper, deleteBtn);
}

function removeMasterCheckbox() {
  const existing = document.getElementById("deleteMasterWrapper");
  if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
}
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
      li.dataset.name = player;

      const nameSpan = document.createElement("span");
      nameSpan.textContent = player;

      // Clicking the item selects/deselects it when in delete mode
      li.addEventListener("click", (ev) => {
        if (!window.__deleteMode) return;
        const selected = li.classList.toggle("selected-for-delete");
        const name = li.dataset.name;
        if (selected) {
          if (name) window.__selectedToDelete.add(name);
        } else {
          if (name) window.__selectedToDelete.delete(name);
        }
        // update master checkbox state
        const master = document.getElementById("deleteMasterCheckbox");
        if (master) {
          const list = document.getElementById("playerList");
          const total = list?.children.length || 0;
          const selectedCount = window.__selectedToDelete.size;
          master.checked = selectedCount > 0 && selectedCount === total;
        }
        updateDeleteButtonVisibility();
      });

      li.appendChild(nameSpan);
      listEl.appendChild(li);
    });
    // Update delete button visibility/count after rendering
    if (typeof updateDeleteButtonVisibility === "function") updateDeleteButtonVisibility();
  } catch (e) {
    console.error("Error loading manage players:", e);
  }
}

// Call appropriate loader on DOMContentLoaded
document.addEventListener("DOMContentLoaded", async () => {
  if (document.getElementById("nameForm")) {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("clear") === "true") {
        // Clear all players when navigated from start-new-game
        await fetch("/removeAllPlayers", { method: "POST" });
        // then load (will show empty list)
        await loadManagePlayers();
        return;
      }

      if (params.get("from") === "leaderboard") {
        // Initialize players from leaderboard but reset scores/history
        try {
          const lb = await fetch("/api/leaderboard");
          if (lb.ok) {
            const players = await lb.json();
            const names = players.map((p) => p.name || p).filter(Boolean);
            await fetch("/resetPlayersForNewGame", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ names }),
            });
          }
        } catch (e) {
          console.error("Failed to init from leaderboard:", e);
        }
        await loadManagePlayers();
        return;
      }

      // Default: just load existing players
      await loadManagePlayers();
    } catch (e) {
      console.error("Error during enterNames init:", e);
      loadManagePlayers();
    }
  }
  // Note: /game page players are loaded by game.js
});

  // Fetch and render current groups into #groupsList
  async function renderGroups(){
    const container = document.getElementById('groupsList');
    if (!container) return;
    try {
      const resp = await fetch('/groups');
      if (!resp.ok) { container.innerHTML = ''; return; }
      const groups = await resp.json();
      container.innerHTML = '';
      groups.forEach((g) => {
        const box = document.createElement('div');
        box.className = 'group-box';

        const header = document.createElement('div');
        header.className = 'group-header-row';

        const nameInput = document.createElement('input');
        nameInput.className = 'group-name-input';
        nameInput.value = g.name || '';

        const setBtn = document.createElement('button');
        setBtn.className = 'group-set-button';
        setBtn.textContent = 'Set';
        setBtn.addEventListener('click', async () => {
          setBtn.disabled = true;
          try {
            const r = await fetch('/setGroupName', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: g.id, name: nameInput.value }) });
            const d = await r.json();
            if (!r.ok || !d.ok) {
              alert('Failed to set group name: ' + (d.error || r.statusText));
              setBtn.disabled = false;
              return;
            }
            // on success: gray out and disable the input and button
            nameInput.disabled = true;
            setBtn.disabled = true;
            // ensure visual state updated
            nameInput.classList.add('group-name-set');
          } catch (e) { alert('Network error: ' + e.message); setBtn.disabled = false; }
        });

        header.appendChild(nameInput);
        header.appendChild(setBtn);
        box.appendChild(header);

        const membersDiv = document.createElement('div');
        membersDiv.className = 'group-members';
        (g.members || []).forEach((m) => {
          const mEl = document.createElement('div');
          mEl.className = 'group-member';
          mEl.textContent = m;
          membersDiv.appendChild(mEl);
        });
        box.appendChild(membersDiv);

        container.appendChild(box);
      });
      // After rendering groups, update start-with-groups button visibility
      updateStartWithGroupsVisibility(groups);
    } catch (e) {
      console.error('Failed to render groups', e);
    }
  }

  // Render groups on page load
  document.addEventListener('DOMContentLoaded', () => {
    renderGroups();
      // set initial visibility based on game type
      (async () => {
        try {
          const resp = await fetch('/getGameType');
          if (resp.ok) {
            const d = await resp.json();
            const t = d?.type || '';
            const show = t === 'quiz';
            const groupsHeader = document.querySelectorAll('.groups-header');
            const groupsList = document.getElementById('groupsList');
            const banner = document.getElementById('groupsBannerCenter');
            if (groupsHeader) groupsHeader.forEach(h => { h.style.display = show ? '' : 'none'; });
            if (groupsList) groupsList.style.display = show ? '' : 'none';
            if (banner) banner.style.display = show ? '' : 'none';
          }
        } catch (e) { }
      })();
  });

/**
 * Show the start-with-groups button only when all groups have non-empty names.
 */
function updateStartWithGroupsVisibility(groups){
  try{
    const btn = document.getElementById('startWithGroupsBtn');
    if (!btn) return;
    if (!groups || !Array.isArray(groups) || groups.length === 0){
      btn.style.display = 'none';
      return;
    }
    const allNamed = groups.every(g => typeof g.name === 'string' && g.name.trim().length > 0);
    btn.style.display = allNamed ? '' : 'none';
    btn.disabled = !allNamed;
  }catch(e){ 
    console.error('Failed to update start-with-groups button visibility', e);
  }
}

// Toggle groups visibility helper (used when game type changes)
function setGroupsVisibility(show){
  const groupsHeader = document.querySelectorAll('.groups-header');
  const groupsList = document.getElementById('groupsList');
  const banner = document.getElementById('groupsBannerCenter');
  if (groupsHeader) groupsHeader.forEach(h => { h.style.display = show ? '' : 'none'; });
  if (groupsList) groupsList.style.display = show ? '' : 'none';
  if (banner) banner.style.display = show ? '' : 'none';
}

// Listen for gameType selector changes to show/hide groups
document.addEventListener('DOMContentLoaded', () => {
  const gt = document.getElementById('gameType');
  if (gt) {
    gt.addEventListener('change', (e) => {
      const val = (e.target.value || '').toString();
      setGroupsVisibility(val === 'quiz');
    });
  }
});

// Use event delegation for start-with-groups button (delegates to document since button may be recreated)
document.addEventListener('click', async (e) => {
  const startBtnGroups = e.target.closest('#startWithGroupsBtn');
  if (!startBtnGroups) return;
  console.log('Start-with-groups button clicked');
  
  // double-check groups names before starting
  try{
    console.log('Verifying group names before starting game with groups');
    const respG = await fetch('/groups');
    if (!respG.ok) { alert('Unable to verify groups'); return; }
    const groups = await respG.json();
    const allNamed = groups.every(g => typeof g.name === 'string' && g.name.trim().length > 0);
    if (!allNamed) { alert('Please set all group names before starting a game with groups.'); return; }
    const ok = confirm('Start a Quiz with these groups as players?');
    if (!ok) return;
  } catch (e) { alert('Network error: ' + e.message); console.error(e); return; }

  startBtnGroups.disabled = true;
  try {
    const resp = await fetch('/startGameWithGroups', { method: 'POST' });
    const d = resp.ok ? await resp.json() : null;
    if (resp.ok && d && d.ok) {
      // navigate to game page
      window.location.href = '/game';
      return;
    }
    alert('Failed to start game with groups');
  } catch (e) { alert('Network error: ' + e.message); console.error(e); }
  finally { startBtnGroups.disabled = false; }
});


// HOME / ENTER NAMES START BUTTON: navigate according to page
const startBtn = document.getElementById("startGameBtn");
if (startBtn) {
  startBtn.addEventListener("click", () => {
    const path = window.location.pathname;
    if (path === "/" || path === "") {
      // from home -> go to enter names and clear list
      window.location.href = "/enterNames?clear=true";
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

// Groups UI: Create Groups button -> shows input + Create/Cancel
const createGroupsBtn = document.getElementById("createGroupsBtn");
if (createGroupsBtn) {
  createGroupsBtn.addEventListener("click", () => {
    const banner = document.getElementById("groupsBannerCenter");
    if (!banner) return;
    // save previous HTML to restore on cancel
    if (!banner.dataset.prevHtml) banner.dataset.prevHtml = banner.innerHTML;
    banner.innerHTML = "";

    const label = document.createElement("label");
    label.textContent = "Number of groups:";
    label.style.marginRight = "8px";

    const input = document.createElement("input");
    input.type = "number";
    input.min = "1";
    input.id = "createGroupsInput";
    input.placeholder = "# groups";
    input.style.width = "100px";
    input.style.marginRight = "8px";
    input.className = "group-number-input";

    const confirm = document.createElement("button");
    confirm.type = "button";
    confirm.id = "createGroupsConfirmBtn";
    confirm.className = "btn-create-groups";
    confirm.textContent = "Create";
    confirm.style.width = "90px";

    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.id = "createGroupsCancelBtn";
    cancel.className = "btn btn-cancel";
    cancel.textContent = "Cancel";
    cancel.style.width = "90px";
    cancel.addEventListener("click", () => {
      // restore banner
      if (banner.dataset.prevHtml) {
        banner.innerHTML = banner.dataset.prevHtml;
        delete banner.dataset.prevHtml;
        // reattach event handler by reloading script's listener
        setTimeout(() => {
          const recreated = document.getElementById("createGroupsBtn");
          if (recreated) recreated.addEventListener("click", () => window.location.reload());
        }, 20);
      }
    });

    // confirm behavior: call server to create groups
    confirm.addEventListener("click", async () => {
      const val = parseInt(input.value, 10);
      if (!val || val < 1) {
        alert('Please enter a valid number of groups');
        input.focus();
        return;
      }
      confirm.disabled = true;
      try {
        const resp = await fetch('/createGroups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ count: val })
        });
        const data = await resp.json();
        if (resp.ok && data.ok) {
          // restore banner to original state
          if (banner.dataset.prevHtml) {
            banner.innerHTML = banner.dataset.prevHtml;
            delete banner.dataset.prevHtml;
          }
          // render groups
          renderGroups();
        } else {
          alert('Failed to create groups: ' + (data.error || resp.statusText));
        }
      } catch (e) {
        alert('Network error: ' + e.message);
      } finally {
        confirm.disabled = false;
      }
    });

    banner.appendChild(label);
    banner.appendChild(input);
    banner.appendChild(confirm);
    banner.appendChild(cancel);
    input.focus();
  });
}
