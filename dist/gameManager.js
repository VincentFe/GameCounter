import Game from "./models/Game.js";
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
export async function saveGame(baseDir) {
    if (gameInstance) {
        await gameInstance.saveToFile(baseDir);
    }
}
export function resetGame() {
    gameInstance = null;
}
export default { initializeGame, getGame, saveGame, resetGame };
//# sourceMappingURL=gameManager.js.map