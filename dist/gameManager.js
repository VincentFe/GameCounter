import path from "path";
import Game from "./models/Game.js";
import fs from "fs/promises";
let gameInstance = null;
export async function initializeGame(baseDir) {
    if (!gameInstance) {
        // Start with an empty game instead of loading from old names.txt
        gameInstance = new Game([], "Unnamed Game");
    }
    return gameInstance;
}
export function getGame() {
    if (!gameInstance) {
        throw new Error("Game not initialized. Call initializeGame first.");
    }
    return gameInstance;
}
export async function loadGameByName(baseDir, gameName) {
    try {
        const dbDir = path.join(baseDir, "..", "db");
        const filePath = path.join(dbDir, `${gameName}.json`);
        const data = await fs.readFile(filePath, "utf8");
        const gameData = JSON.parse(data);
        gameInstance = Game.fromJSON(gameData);
        return gameInstance;
    }
    catch (err) {
        throw new Error(`Failed to load game "${gameName}": ${err}`);
    }
}
export async function saveGame(baseDir) {
    if (gameInstance) {
        await gameInstance.saveToFile(baseDir);
    }
}
export function resetGame() {
    gameInstance = null;
}
export default { initializeGame, getGame, loadGameByName, saveGame, resetGame };
//# sourceMappingURL=gameManager.js.map