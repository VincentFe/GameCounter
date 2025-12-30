import fs from "fs";
import path from "path";
import { getGame, saveGame, loadGameByName, setGameInstance } from "./gameManager.js";
import Player from "./Player.js";
import { Quiz, ChineesPoepeke } from "./Game.js";
/**
 * Add a new player to the current game by name.
 * Validates that the name is a non-empty string and does not already exist.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @param {string} name - The name of the player to add.
 * @returns {Promise<{ ok: boolean; error?: string }>} Success status and optional error message.
 */
export async function addPlayerByName(baseDir, name) {
    if (!name || typeof name !== "string")
        return { ok: false, error: "Name required" };
    const game = getGame();
    if (game.findPlayerIndexByName(name) !== -1)
        return { ok: false, error: "Player already exists" };
    game.addPlayer(new Player(name));
    await saveGame(baseDir);
    return { ok: true };
}
/**
 * Save a player name (alias for addPlayerByName).
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @param {string} name - The name of the player to add.
 * @returns {Promise<{ ok: boolean; error?: string }>} Success status and optional error message.
 */
export async function saveName(baseDir, name) {
    return addPlayerByName(baseDir, name);
}
/**
 * Set the game's name.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @param {string} name - The new game name.
 * @returns {Promise<{ ok: boolean; error?: string }>} Success status and optional error message.
 */
export async function setGameName(baseDir, name) {
    if (!name || typeof name !== "string")
        return { ok: false, error: "Name required" };
    const game = getGame();
    game.setName(name);
    await saveGame(baseDir);
    return { ok: true };
}
/**
 * Set the game type.
 * Valid types are "quiz" and "chinees poepeke".
 * Creates a new game instance of the appropriate type while preserving player data.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @param {string} type - The game type ("quiz" or "chinees poepeke").
 * @returns {Promise<{ ok: boolean; error?: string }>} Success status and optional error message.
 */
export async function setGameType(baseDir, type) {
    if (!type || (type !== "quiz" && type !== "chinees poepeke"))
        return { ok: false, error: "Invalid game type" };
    const currentGame = getGame();
    const players = currentGame.getPlayers();
    const name = currentGame.getGameName();
    const active = currentGame.isActive();
    let newGame;
    if (type === "quiz") {
        newGame = new Quiz(players, name, active);
    }
    else {
        newGame = new ChineesPoepeke(players, name, active);
    }
    setGameInstance(newGame);
    await saveGame(baseDir);
    return { ok: true };
}
/**
 * Get all players in the current game with their scores.
 * @returns {Array<{ name: string; score: number }>} Array of players with their current scores.
 */
export function getPlayers() {
    const game = getGame();
    return game.toPlayersWithScores();
}
/**
 * Get the names of all players in the current game.
 * @returns {string[]} Array of player names.
 */
export function getPlayerNames() {
    const game = getGame();
    return game.toPlainNames();
}
/**
 * Delete a player from the current game by name.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @param {string} name - The name of the player to delete.
 * @returns {Promise<{ ok: boolean; error?: string }>} Success status and optional error message.
 */
export async function deletePlayerByName(baseDir, name) {
    if (!name)
        return { ok: false, error: "Name required" };
    const game = getGame();
    const removed = game.removePlayerByName(name);
    if (!removed)
        return { ok: false, error: "Name not found" };
    await saveGame(baseDir);
    return { ok: true };
}
/**
 * Remove all players from the current game.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<{ ok: boolean; error?: string }>} Success status.
 */
export async function removeAllPlayers(baseDir) {
    const game = getGame();
    game.removeAllPlayers();
    await saveGame(baseDir);
    return { ok: true };
}
/**
 * Update a player's score by adding a delta.
 * For "chinees poepeke" games, ensures the final score never goes negative.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @param {string} name - The player name.
 * @param {number} score - The score delta to add.
 * @param {number} [historyValue] - Optional value to add to player's history log.
 * @returns {Promise<{ ok: boolean; error?: string }>} Success status and optional error message.
 */
export async function updatePlayerScore(baseDir, name, score, historyValue) {
    if (!name || typeof name !== "string")
        return { ok: false, error: "Name required" };
    if (typeof score !== "number")
        return { ok: false, error: "Score required" };
    const game = getGame();
    const currentScore = game.getPlayerScore(name);
    if (game.getGameType() === "chinees poepeke") {
        const newScore = currentScore + score;
        if (newScore < 0) {
            // don't allow negative final score
            score = -currentScore;
        }
    }
    game.updatePlayerScore(name, score);
    if (typeof historyValue === "number")
        game.addPlayerHistory(name, historyValue);
    await saveGame(baseDir);
    return { ok: true };
}
/**
 * Set a player's score to an absolute value.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @param {string} name - The player name.
 * @param {number} score - The new absolute score value.
 * @returns {Promise<{ ok: boolean; error?: string }>} Success status and optional error message.
 */
export async function setPlayerScore(baseDir, name, score) {
    if (!name)
        return { ok: false, error: "Name required" };
    if (typeof score !== "number")
        return { ok: false, error: "Score required" };
    const game = getGame();
    game.setPlayerScore(name, score);
    await saveGame(baseDir);
    return { ok: true };
}
/**
 * Create groups by randomly assigning players into `count` groups.
 * Distributes players as evenly as possible (some groups may have one extra member).
 */
export async function createGroups(baseDir, count) {
    if (typeof count !== 'number' || count < 1)
        return { ok: false, error: 'Invalid count' };
    const game = getGame();
    // only quiz supports groups
    if (game.getGameType() === 'chinees poepeke')
        return { ok: false, error: 'Groups not supported for this game type' };
    const names = game.toPlainNames();
    // shuffle names
    for (let i = names.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [names[i], names[j]] = [names[j], names[i]];
    }
    const groups = [];
    const total = names.length;
    const baseSize = Math.floor(total / count);
    let remainder = total % count;
    let idx = 0;
    for (let g = 0; g < count; g++) {
        const size = baseSize + (remainder > 0 ? 1 : 0);
        remainder = Math.max(0, remainder - 1);
        const members = names.slice(idx, idx + size);
        idx += size;
        // create group object simple shape; Group class may be available via import if needed
        groups.push({ name: `Group ${g + 1}`, members });
    }
    // set groups on game (convert to Group instances expected by Game.setGroups)
    // lazy import to avoid circular issues
    const { default: Group } = await import('./Group.js');
    const groupInstances = groups.map((g) => new Group(g.name, g.members));
    game.setGroups(groupInstances);
    game.setUseGroups(true);
    await saveGame(baseDir);
    return { ok: true, groups: groupInstances.map((x) => x.toJSON()) };
}
/**
 * Start a new Quiz game where each group is treated as a player.
 * Replaces the current game instance with a Quiz whose players are the group names.
 */
export async function startGameWithGroups(baseDir) {
    const game = getGame();
    console.log('[GameService] startGameWithGroups current game type:', game.getGameType());
    if (game.getGameType() === 'chinees poepeke')
        return { ok: false, error: 'Groups not supported for this game type' };
    const groups = game.getGroups() || [];
    if (!Array.isArray(groups) || groups.length === 0)
        return { ok: false, error: 'No groups available' };
    // Simpler approach: modify the existing game instance to use group-named players
    // Clear existing players and add a player per group (player.name = group.name)
    game.removeAllPlayers();
    const newPlayers = [];
    for (const g of groups) {
        const pname = (g && g.name) ? g.name : (g && g.id) ? g.id : 'Group';
        const p = new Player(pname);
        newPlayers.push(p);
        game.addPlayer(p);
    }
    game.setGroups(groups);
    game.setUseGroups(true);
    console.log('[GameService] startGameWithGroups replaced players with groups:', newPlayers.map(p => p.name));
    await saveGame(baseDir);
    return { ok: true };
}
/**
 * Get groups for current game.
 */
export function getGroups() {
    const game = getGame();
    return (game.getGroups() || []).map((g) => g.toJSON());
}
/**
 * Set a group's name by id.
 */
export async function setGroupName(baseDir, groupId, name) {
    if (!groupId)
        return { ok: false, error: 'groupId required' };
    const game = getGame();
    const groups = game.getGroups();
    const idx = groups.findIndex((g) => g.id === groupId);
    if (idx === -1)
        return { ok: false, error: 'group not found' };
    groups[idx].name = name || groups[idx].name;
    game.setGroups(groups);
    await saveGame(baseDir);
    return { ok: true };
}
/**
 * List all active games from the db folder.
 * Reads all .json files and filters out games marked as inactive.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {string[]} Array of active game names (without .json extension).
 */
export function listGames(baseDir) {
    try {
        const dbDir = path.join(baseDir, "..", "db");
        const files = fs.readdirSync(dbDir);
        const games = [];
        files.forEach((file) => {
            if (file.endsWith('.json')) {
                try {
                    const filePath = path.join(dbDir, file);
                    const data = fs.readFileSync(filePath, 'utf8');
                    const gameData = JSON.parse(data);
                    // only include games that are active (active !== false)
                    if (gameData.active !== false)
                        games.push(file.replace('.json', ''));
                }
                catch (e) { }
            }
        });
        return games;
    }
    catch (e) {
        return [];
    }
}
/**
 * Save the current game instance to file.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<{ ok: boolean }>} Success status.
 */
export async function saveGameInstance(baseDir) {
    await saveGame(baseDir);
    return { ok: true };
}
/**
 * Mark the current game instance as inactive.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<{ ok: boolean; error?: string }>} Success status and optional error message.
 */
export async function markGameInactive(baseDir) {
    const game = getGame();
    game.setActive(false);
    await saveGame(baseDir);
    return { ok: true };
}
/**
 * Get the current game's name.
 * @returns {string} The game name.
 */
export function getGameName() {
    const game = getGame();
    return game.getGameName();
}
/**
 * Get the current game's type.
 * @returns {string} The game type ("quiz" or "chinees poepeke").
 */
export function getGameType() {
    const game = getGame();
    return game.getGameType();
}
/**
 * Get the current round number.
 * @returns {number} The round number.
 */
export function getRound() {
    const game = getGame();
    return game.getRound();
}
/**
 * Set the round number.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @param {number} round - The new round number.
 * @returns {Promise<{ ok: boolean; error?: string }>} Success status and optional error message.
 */
export async function setRound(baseDir, round) {
    if (typeof round !== 'number')
        return { ok: false, error: 'Round required' };
    const game = getGame();
    game.setRound(round);
    await saveGame(baseDir);
    return { ok: true };
}
/**
 * Load a game by name from the db folder and set it as the current instance.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @param {string} name - The game name (without .json extension).
 * @returns {Promise<{ ok: boolean; error?: string }>} Success status and optional error message.
 */
export async function loadGameByNameService(baseDir, name) {
    await loadGameByName(baseDir, name);
    return { ok: true };
}
/**
 * Reset the current game's players to the provided list of names.
 * Each player will have score 0 and an empty history. Saves the game.
 * @param {string} baseDir
 * @param {string[]} names
 */
export async function resetPlayersForNewGame(baseDir, names) {
    const game = getGame();
    // start fresh
    game.removeAllPlayers();
    if (Array.isArray(names)) {
        for (const n of names) {
            if (!n)
                continue;
            game.addPlayer(new Player(n));
            game.setPlayerScore(n, 0);
            // clear history if present
            const players = game.getPlayers();
            const idx = game.findPlayerIndexByName(n);
            if (idx !== -1) {
                players[idx].history = [];
            }
        }
    }
    await saveGame(baseDir);
    return { ok: true };
}
export default { addPlayerByName, saveName, setGameName, setGameType, getPlayers, getPlayerNames, deletePlayerByName, removeAllPlayers, updatePlayerScore, setPlayerScore, listGames, saveGameInstance, markGameInactive, getGameName, getGameType, getRound, setRound, loadGameByNameService, resetPlayersForNewGame };
//# sourceMappingURL=GameService.js.map