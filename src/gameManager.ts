/**
 * Game Manager Module
 * Handles the lifecycle of game instances, including initialization, loading, saving, and resetting.
 * Maintains a singleton game instance that is used throughout the application.
 */

import path from "path";
import Game from "./models/Game.js";
import fs from "fs/promises";

/**
 * GameManager class wraps game lifecycle operations and persists state to disk.
 */
export class GameManager {
  private gameInstance: Game | null = null;

  /** Initialize or return existing game instance */
  async initialize(baseDir: string): Promise<Game> {
    if (!this.gameInstance) {
      this.gameInstance = new Game([], "Unnamed Game");
    }
    return this.gameInstance;
  }

  /** Retrieve current game instance or throw if uninitialized */
  getGame(): Game {
    if (!this.gameInstance) {
      throw new Error("Game not initialized. Call initialize() first.");
    }
    return this.gameInstance;
  }

  /** Load a saved game by name and set as the current instance */
  async loadGameByName(baseDir: string, gameName: string): Promise<Game> {
    try {
      const dbDir = path.join(baseDir, "..", "db");
      const filePath = path.join(dbDir, `${gameName}.json`);
      const data = await fs.readFile(filePath, "utf8");
      const gameData = JSON.parse(data);
      this.gameInstance = Game.fromJSON(gameData);
      return this.gameInstance;
    } catch (err) {
      throw new Error(`Failed to load game "${gameName}": ${err}`);
    }
  }

  /** Save current game instance to disk if present */
  async saveGame(baseDir: string): Promise<void> {
    if (this.gameInstance) {
      await this.gameInstance.saveToFile(baseDir);
    }
  }

  /** Reset the in-memory game instance */
  resetGame(): void {
    this.gameInstance = null;
  }
}

/**
 * Export a singleton manager instance for application-wide usage.
 */
export const gameManager = new GameManager();

// Backwards-compatible wrappers for existing import patterns
export async function initializeGame(baseDir: string) {
  return gameManager.initialize(baseDir);
}

export function getGame() {
  return gameManager.getGame();
}

export async function loadGameByName(baseDir: string, gameName: string) {
  return gameManager.loadGameByName(baseDir, gameName);
}

export async function saveGame(baseDir: string) {
  return gameManager.saveGame(baseDir);
}

export function resetGame() {
  return gameManager.resetGame();
}

export default gameManager;
