import { IncomingMessage, ServerResponse } from "http";
/**
 * Render the enterNames.html page.
 * Optionally injects initial player data into a window.__initialPlayers script variable.
 * @param {ServerResponse} res - The HTTP response object.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @param {Array<{ name: string; score?: number }>} [initialPlayers] - Optional initial players to inject.
 * @returns {void}
 */
export declare function renderEnterNames(res: ServerResponse, baseDir: string, initialPlayers?: Array<{
    name: string;
    score?: number;
}>): void;
/**
 * Add a player to the current game.
 * Validates and delegates to GameService.addPlayerByName().
 * @param {IncomingMessage} req - HTTP request with JSON body { name: string }.
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<void>} Resolves when response is sent.
 */
export declare function saveName(req: IncomingMessage, res: ServerResponse, baseDir: string): Promise<void>;
/**
 * Set the game's name.
 * Validates and delegates to GameService.setGameName().
 * @param {IncomingMessage} req - HTTP request with JSON body { name: string }.
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<void>} Resolves when response is sent.
 */
export declare function setGameName(req: IncomingMessage, res: ServerResponse, baseDir: string): Promise<void>;
/**
 * Set the game's type.
 * Validates and delegates to GameService.setGameType().
 * @param {IncomingMessage} req - HTTP request with JSON body { type: string }.
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<void>} Resolves when response is sent.
 */
export declare function setGameType(req: IncomingMessage, res: ServerResponse, baseDir: string): Promise<void>;
/**
 * Get all players and their scores from the current game.
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} [baseDir] - Optional base directory (unused).
 * @returns {void}
 */
export declare function getPlayers(res: ServerResponse, baseDir?: string): void;
/**
 * Get all player names from the current game.
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} [baseDir] - Optional base directory (unused).
 * @returns {void}
 */
export declare function getPlayerNames(res: ServerResponse, baseDir?: string): void;
/**
 * Delete a player from the current game.
 * Validates and delegates to GameService.deletePlayerByName().
 * @param {IncomingMessage} req - HTTP request with JSON body { name: string }.
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<void>} Resolves when response is sent.
 */
export declare function deletePlayer(req: IncomingMessage, res: ServerResponse, baseDir: string): Promise<void>;
/**
 * Remove all players from the current game.
 * @param {IncomingMessage} req - HTTP request object.
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<void>} Resolves when response is sent.
 */
export declare function removeAllPlayers(req: IncomingMessage, res: ServerResponse, baseDir: string): Promise<void>;
/**
 * Update a player's score by adding a delta.
 * Supports optional history value logging.
 * @param {IncomingMessage} req - HTTP request with JSON body { name: string; score: number; historyValue?: number }.
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<void>} Resolves when response is sent.
 */
export declare function updatePlayerScore(req: IncomingMessage, res: ServerResponse, baseDir: string): Promise<void>;
/**
 * Set a player's score to an absolute value.
 * Validates and delegates to GameService.setPlayerScore().
 * @param {IncomingMessage} req - HTTP request with JSON body { name: string; score: number }.
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<void>} Resolves when response is sent.
 */
export declare function setPlayerScore(req: IncomingMessage, res: ServerResponse, baseDir: string): Promise<void>;
/**
 * List all active games from the db folder.
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {void}
 */
export declare function listGames(res: ServerResponse, baseDir: string): void;
/**
 * Save the current game instance to file.
 * @param {IncomingMessage} req - HTTP request object.
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<void>} Resolves when response is sent.
 */
export declare function saveGameInstance(req: IncomingMessage, res: ServerResponse, baseDir: string): Promise<void>;
/**
 * Add a player to the current game (wrapper for saveName).
 * @param {IncomingMessage} req - HTTP request with JSON body { name: string }.
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<void>} Resolves when response is sent.
 */
export declare function addPlayer(req: IncomingMessage, res: ServerResponse, baseDir: string): Promise<void>;
/**
 * Mark the current game as inactive.
 * @param {IncomingMessage} req - HTTP request object.
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<void>} Resolves when response is sent.
 */
export declare function markGameInactive(req: IncomingMessage, res: ServerResponse, baseDir: string): Promise<void>;
/**
 * Get the current game's name.
 * @param {ServerResponse} res - HTTP response object.
 * @returns {void}
 */
export declare function getGameName(res: ServerResponse): void;
/**
 * Get the current game's type.
 * @param {ServerResponse} res - HTTP response object.
 * @returns {void}
 */
export declare function getGameType(res: ServerResponse): void;
/**
 * Get the current round number.
 * @param {ServerResponse} res - HTTP response object.
 * @returns {void}
 */
export declare function getRound(res: ServerResponse): void;
/**
 * Set the round number.
 * Validates and delegates to GameService.setRound().
 * @param {IncomingMessage} req - HTTP request with JSON body { round: number }.
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<void>} Resolves when response is sent.
 */
export declare function setRound(req: IncomingMessage, res: ServerResponse, baseDir: string): Promise<void>;
/**
 * Reset players for a new game using the provided name list.
 * Body: { names: string[] }
 */
export declare function resetPlayersForNewGame(req: IncomingMessage, res: ServerResponse, baseDir: string): Promise<void>;
/**
 * Create groups endpoint.
 * Body: { count: number }
 */
export declare function createGroups(req: IncomingMessage, res: ServerResponse, baseDir: string): Promise<void>;
/**
 * Return groups for current game.
 */
export declare function getGroups(res: ServerResponse): void;
/**
 * Set a group's name.
 * Body: { id: string, name: string }
 */
export declare function setGroupName(req: IncomingMessage, res: ServerResponse, baseDir: string): Promise<void>;
/**
 * Start a quiz game using existing groups as players.
 * POST /startGameWithGroups
 */
export declare function startGameWithGroups(req: IncomingMessage, res: ServerResponse, baseDir: string): Promise<void>;
declare const _default: {};
export default _default;
//# sourceMappingURL=enterNames.d.ts.map