/**
 * Add a new player to the current game by name.
 * Validates that the name is a non-empty string and does not already exist.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @param {string} name - The name of the player to add.
 * @returns {Promise<{ ok: boolean; error?: string }>} Success status and optional error message.
 */
export declare function addPlayerByName(baseDir: string, name: string): Promise<{
    ok: boolean;
    error?: string;
}>;
/**
 * Save a player name (alias for addPlayerByName).
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @param {string} name - The name of the player to add.
 * @returns {Promise<{ ok: boolean; error?: string }>} Success status and optional error message.
 */
export declare function saveName(baseDir: string, name: string): Promise<{
    ok: boolean;
    error?: string;
}>;
/**
 * Set the game's name.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @param {string} name - The new game name.
 * @returns {Promise<{ ok: boolean; error?: string }>} Success status and optional error message.
 */
export declare function setGameName(baseDir: string, name: string): Promise<{
    ok: boolean;
    error: string;
} | {
    ok: boolean;
    error?: undefined;
}>;
/**
 * Set the game type.
 * Valid types are "quiz" and "chinees poepeke".
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @param {string} type - The game type ("quiz" or "chinees poepeke").
 * @returns {Promise<{ ok: boolean; error?: string }>} Success status and optional error message.
 */
export declare function setGameType(baseDir: string, type: string): Promise<{
    ok: boolean;
    error: string;
} | {
    ok: boolean;
    error?: undefined;
}>;
/**
 * Get all players in the current game with their scores.
 * @returns {Array<{ name: string; score: number }>} Array of players with their current scores.
 */
export declare function getPlayers(): any[];
/**
 * Get the names of all players in the current game.
 * @returns {string[]} Array of player names.
 */
export declare function getPlayerNames(): string[];
/**
 * Delete a player from the current game by name.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @param {string} name - The name of the player to delete.
 * @returns {Promise<{ ok: boolean; error?: string }>} Success status and optional error message.
 */
export declare function deletePlayerByName(baseDir: string, name: string): Promise<{
    ok: boolean;
    error: string;
} | {
    ok: boolean;
    error?: undefined;
}>;
/**
 * Remove all players from the current game.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<{ ok: boolean; error?: string }>} Success status.
 */
export declare function removeAllPlayers(baseDir: string): Promise<{
    ok: boolean;
}>;
/**
 * Update a player's score by adding a delta.
 * For "chinees poepeke" games, ensures the final score never goes negative.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @param {string} name - The player name.
 * @param {number} score - The score delta to add.
 * @param {number} [historyValue] - Optional value to add to player's history log.
 * @returns {Promise<{ ok: boolean; error?: string }>} Success status and optional error message.
 */
export declare function updatePlayerScore(baseDir: string, name: string, score: number, historyValue?: number): Promise<{
    ok: boolean;
    error: string;
} | {
    ok: boolean;
    error?: undefined;
}>;
/**
 * Set a player's score to an absolute value.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @param {string} name - The player name.
 * @param {number} score - The new absolute score value.
 * @returns {Promise<{ ok: boolean; error?: string }>} Success status and optional error message.
 */
export declare function setPlayerScore(baseDir: string, name: string, score: number): Promise<{
    ok: boolean;
    error: string;
} | {
    ok: boolean;
    error?: undefined;
}>;
/**
 * List all active games from the db folder.
 * Reads all .json files and filters out games marked as inactive.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {string[]} Array of active game names (without .json extension).
 */
export declare function listGames(baseDir: string): string[];
/**
 * Save the current game instance to file.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<{ ok: boolean }>} Success status.
 */
export declare function saveGameInstance(baseDir: string): Promise<{
    ok: boolean;
}>;
/**
 * Mark the current game instance as inactive.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<{ ok: boolean; error?: string }>} Success status and optional error message.
 */
export declare function markGameInactive(baseDir: string): Promise<{
    ok: boolean;
}>;
/**
 * Get the current game's name.
 * @returns {string} The game name.
 */
export declare function getGameName(): string;
/**
 * Get the current game's type.
 * @returns {string} The game type ("quiz" or "chinees poepeke").
 */
export declare function getGameType(): import("./Game.js").GameType;
/**
 * Get the current round number.
 * @returns {number} The round number.
 */
export declare function getRound(): number;
/**
 * Set the round number.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @param {number} round - The new round number.
 * @returns {Promise<{ ok: boolean; error?: string }>} Success status and optional error message.
 */
export declare function setRound(baseDir: string, round: number): Promise<{
    ok: boolean;
    error: string;
} | {
    ok: boolean;
    error?: undefined;
}>;
/**
 * Load a game by name from the db folder and set it as the current instance.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @param {string} name - The game name (without .json extension).
 * @returns {Promise<{ ok: boolean; error?: string }>} Success status and optional error message.
 */
export declare function loadGameByNameService(baseDir: string, name: string): Promise<{
    ok: boolean;
}>;
declare const _default: {
    addPlayerByName: typeof addPlayerByName;
    saveName: typeof saveName;
    setGameName: typeof setGameName;
    setGameType: typeof setGameType;
    getPlayers: typeof getPlayers;
    getPlayerNames: typeof getPlayerNames;
    deletePlayerByName: typeof deletePlayerByName;
    removeAllPlayers: typeof removeAllPlayers;
    updatePlayerScore: typeof updatePlayerScore;
    setPlayerScore: typeof setPlayerScore;
    listGames: typeof listGames;
    saveGameInstance: typeof saveGameInstance;
    markGameInactive: typeof markGameInactive;
    getGameName: typeof getGameName;
    getGameType: typeof getGameType;
    getRound: typeof getRound;
    setRound: typeof setRound;
    loadGameByNameService: typeof loadGameByNameService;
};
export default _default;
//# sourceMappingURL=GameService.d.ts.map