import Game from "./Game.js";
/**
 * Initialize the global game instance.
 * If not already initialized, creates a new game with default name "Unnamed Game".
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<Game>} A promise resolving to the game instance.
 */
export declare function initializeGame(baseDir: string): Promise<Game>;
/**
 * Get the current global game instance.
 * Throws an error if the game has not been initialized.
 * @returns {Game} The global game instance.
 * @throws {Error} If game was not initialized via initializeGame.
 */
export declare function getGame(): Game;
/**
 * Load a game from a JSON file and set it as the global instance.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @param {string} gameName - The name of the game file to load (without .json extension).
 * @returns {Promise<Game>} A promise resolving to the loaded game instance.
 * @throws {Error} If the file cannot be read or parsed.
 */
export declare function loadGameByName(baseDir: string, gameName: string): Promise<Game>;
/**
 * Save the current game instance to a JSON file.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<void>} A promise that resolves when the file is written.
 */
export declare function saveGame(baseDir: string): Promise<void>;
/**
 * Reset the global game instance (set to null).
 * Useful for clearing state between test sessions or app restarts.
 */
export declare function resetGame(): void;
declare const _default: {
    initializeGame: typeof initializeGame;
    getGame: typeof getGame;
    loadGameByName: typeof loadGameByName;
    saveGame: typeof saveGame;
    resetGame: typeof resetGame;
};
export default _default;
//# sourceMappingURL=gameManager.d.ts.map