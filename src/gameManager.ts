import path from "path";
import Game from "./models/Game.js";

let gameInstance: Game | null = null;

export async function initializeGame(baseDir: string): Promise<Game> {
  if (!gameInstance) {
    gameInstance = await Game.loadFromFile(baseDir);
  }
  return gameInstance;
}

export function getGame(): Game {
  if (!gameInstance) {
    throw new Error("Game not initialized. Call initializeGame first.");
  }
  return gameInstance;
}

export async function saveGame(baseDir: string): Promise<void> {
  if (gameInstance) {
    await gameInstance.saveToFile(baseDir);
  }
}

export function resetGame(): void {
  gameInstance = null;
}

export default { initializeGame, getGame, saveGame, resetGame };
