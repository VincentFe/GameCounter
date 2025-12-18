/**
 * Game Manager Module
 * Handles the lifecycle of game instances, including initialization, loading, saving, and resetting.
 * Maintains a singleton game instance that is used throughout the application.
 */
import Game from "./models/Game.js";
/**
 * GameManager class wraps game lifecycle operations and persists state to disk.
 */
export declare class GameManager {
    private gameInstance;
    /** Initialize or return existing game instance */
    initialize(baseDir: string): Promise<Game>;
    /** Retrieve current game instance or throw if uninitialized */
    getGame(): Game;
    /** Load a saved game by name and set as the current instance */
    loadGameByName(baseDir: string, gameName: string): Promise<Game>;
    /** Save current game instance to disk if present */
    saveGame(baseDir: string): Promise<void>;
    /** Reset the in-memory game instance */
    resetGame(): void;
}
/**
 * Export a singleton manager instance for application-wide usage.
 */
export declare const gameManager: GameManager;
export declare function initializeGame(baseDir: string): Promise<Game>;
export declare function getGame(): Game;
export declare function loadGameByName(baseDir: string, gameName: string): Promise<Game>;
export declare function saveGame(baseDir: string): Promise<void>;
export declare function resetGame(): void;
export default gameManager;
//# sourceMappingURL=gameManager.d.ts.map