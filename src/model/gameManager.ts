import path from "path";
import { Game, Quiz, ChineesPoepeke } from "./Game.js";
import fs from "fs/promises";

let gameInstance: Game | null = null;

/**
 * Initialize the global game instance.
 * If not already initialized, creates a new Quiz game with default name "Unnamed Game".
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<Game>} A promise resolving to the game instance.
 */
export async function initializeGame(baseDir: string): Promise<Game> {
  if (!gameInstance) {
    gameInstance = new Quiz([], "Unnamed Game");
  }
  return gameInstance;
}

/**
 * Get the current global game instance.
 * Throws an error if the game has not been initialized.
 * @returns {Game} The global game instance.
 * @throws {Error} If game was not initialized via initializeGame.
 */
export function getGame(): Game {
  if (!gameInstance) {
    throw new Error("Game not initialized. Call initializeGame first.");
  }
  return gameInstance;
}

/**
 * Load a game from a JSON file and set it as the global instance.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @param {string} gameName - The name of the game file to load (without .json extension).
 * @returns {Promise<Game>} A promise resolving to the loaded game instance.
 * @throws {Error} If the file cannot be read or parsed.
 */
export async function loadGameByName(baseDir: string, gameName: string): Promise<Game> {
  try {
    const dbDir = path.join(baseDir, "..", "db");
    const filePath = path.join(dbDir, `${gameName}.json`);
    const data = await fs.readFile(filePath, "utf8");
    const gameData = JSON.parse(data);
    gameInstance = Game.fromJSON(gameData);
    return gameInstance;
  } catch (err) {
    throw new Error(`Failed to load game "${gameName}": ${err}`);
  }
}

/**
 * Save the current game instance to a JSON file.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<void>} A promise that resolves when the file is written.
 */
export async function saveGame(baseDir: string): Promise<void> {
  if (gameInstance) {
    await gameInstance.saveToFile(baseDir);
  }
}

/**
 * Reset the global game instance (set to null).
 * Useful for clearing state between test sessions or app restarts.
 */
export function resetGame(): void {
  gameInstance = null;
}

/**
 * Set the global game instance directly.
 * @param {Game} game - The game instance to set.
 */
export function setGameInstance(game: Game): void {
  gameInstance = game;
}

export default { initializeGame, getGame, loadGameByName, saveGame, resetGame, setGameInstance };
