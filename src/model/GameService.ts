import fs from "fs";
import path from "path";
import { getGame, saveGame, loadGameByName } from "./gameManager.js";
import Player from "./Player.js";
import Game from "./Game.js";

/**
 * Add a new player to the current game by name.
 * Validates that the name is a non-empty string and does not already exist.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @param {string} name - The name of the player to add.
 * @returns {Promise<{ ok: boolean; error?: string }>} Success status and optional error message.
 */
export async function addPlayerByName(baseDir: string, name: string): Promise<{ ok: boolean; error?: string }>{
  if (!name || typeof name !== "string") return { ok: false, error: "Name required" };
  const game = getGame();
  if (game.findPlayerIndexByName(name) !== -1) return { ok: false, error: "Player already exists" };
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
export async function saveName(baseDir: string, name: string){
  return addPlayerByName(baseDir, name);
}

/**
 * Set the game's name.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @param {string} name - The new game name.
 * @returns {Promise<{ ok: boolean; error?: string }>} Success status and optional error message.
 */
export async function setGameName(baseDir: string, name: string){
  if (!name || typeof name !== "string") return { ok: false, error: "Name required" };
  const game = getGame();
  game.setName(name);
  await saveGame(baseDir);
  return { ok: true };
}

/**
 * Set the game type.
 * Valid types are "quiz" and "chinees poepeke".
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @param {string} type - The game type ("quiz" or "chinees poepeke").
 * @returns {Promise<{ ok: boolean; error?: string }>} Success status and optional error message.
 */
export async function setGameType(baseDir: string, type: string){
  if (!type || (type !== "quiz" && type !== "chinees poepeke")) return { ok: false, error: "Invalid game type" };
  const game = getGame();
  game.setGameType(type as any);
  await saveGame(baseDir);
  return { ok: true };
}

/**
 * Get all players in the current game with their scores.
 * @returns {Array<{ name: string; score: number }>} Array of players with their current scores.
 */
export function getPlayers(){
  const game = getGame();
  return game.toPlayersWithScores();
}

/**
 * Get the names of all players in the current game.
 * @returns {string[]} Array of player names.
 */
export function getPlayerNames(){
  const game = getGame();
  return game.toPlainNames();
}

/**
 * Delete a player from the current game by name.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @param {string} name - The name of the player to delete.
 * @returns {Promise<{ ok: boolean; error?: string }>} Success status and optional error message.
 */
export async function deletePlayerByName(baseDir: string, name: string){
  if (!name) return { ok: false, error: "Name required" };
  const game = getGame();
  const removed = game.removePlayerByName(name);
  if (!removed) return { ok: false, error: "Name not found" };
  await saveGame(baseDir);
  return { ok: true };
}

/**
 * Remove all players from the current game.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<{ ok: boolean; error?: string }>} Success status.
 */
export async function removeAllPlayers(baseDir: string){
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
export async function updatePlayerScore(baseDir: string, name: string, score: number, historyValue?: number){
  if (!name || typeof name !== "string") return { ok: false, error: "Name required" };
  if (typeof score !== "number") return { ok: false, error: "Score required" };
  const game = getGame();
  const currentScore = game.getPlayerScore(name);
  if (game.getGameType() === "chinees poepeke"){
    const newScore = currentScore + score;
    if (newScore < 0){
      // don't allow negative final score
      score = -currentScore;
    }
  }
  game.updatePlayerScore(name, score);
  if (typeof historyValue === "number") game.addPlayerHistory(name, historyValue);
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
export async function setPlayerScore(baseDir: string, name: string, score: number){
  if (!name) return { ok: false, error: "Name required" };
  if (typeof score !== "number") return { ok: false, error: "Score required" };
  const game = getGame();
  game.setPlayerScore(name, score);
  await saveGame(baseDir);
  return { ok: true };
}

/**
 * List all active games from the db folder.
 * Reads all .json files and filters out games marked as inactive.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {string[]} Array of active game names (without .json extension).
 */
export function listGames(baseDir: string){
  try{
    const dbDir = path.join(baseDir, "..", "db");
    const files = fs.readdirSync(dbDir);
    const games: string[] = [];
    files.forEach((file) => {
      if (file.endsWith('.json')){
        try{
          const filePath = path.join(dbDir,file);
          const data = fs.readFileSync(filePath,'utf8');
          const gameData = JSON.parse(data);
          if (gameData.active !== false) games.push(file.replace('.json',''));
        }catch(e){ }
      }
    });
    return games;
  }catch(e){
    return [];
  }
}

/**
 * Save the current game instance to file.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<{ ok: boolean }>} Success status.
 */
export async function saveGameInstance(baseDir: string){
  await saveGame(baseDir);
  return { ok: true };
}

/**
 * Mark the current game instance as inactive.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<{ ok: boolean; error?: string }>} Success status and optional error message.
 */
export async function markGameInactive(baseDir: string){
  const game = getGame();
  game.setActive(false);
  await saveGame(baseDir);
  return { ok: true };
}

/**
 * Get the current game's name.
 * @returns {string} The game name.
 */
export function getGameName(){
  const game = getGame();
  return game.getGameName();
}

/**
 * Get the current game's type.
 * @returns {string} The game type ("quiz" or "chinees poepeke").
 */
export function getGameType(){
  const game = getGame();
  return game.getGameType();
}

/**
 * Get the current round number.
 * @returns {number} The round number.
 */
export function getRound(){
  const game = getGame();
  return game.getRound();
}

/**
 * Set the round number.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @param {number} round - The new round number.
 * @returns {Promise<{ ok: boolean; error?: string }>} Success status and optional error message.
 */
export async function setRound(baseDir: string, round: number){
  if (typeof round !== 'number') return { ok: false, error: 'Round required' };
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
export async function loadGameByNameService(baseDir: string, name: string){
  await loadGameByName(baseDir, name);
  return { ok: true };
}

export default { addPlayerByName, saveName, setGameName, setGameType, getPlayers, getPlayerNames, deletePlayerByName, removeAllPlayers, updatePlayerScore, setPlayerScore, listGames, saveGameInstance, markGameInactive, getGameName, getGameType, getRound, setRound, loadGameByNameService };
