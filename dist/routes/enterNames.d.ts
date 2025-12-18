/**
 * Enter Names Route Handler
 * Manages player entry, game naming, and player management functionality.
 * Handles all API endpoints related to adding, removing, and updating players.
 */
import { IncomingMessage, ServerResponse } from "http";
/**
 * Renders the enter names page where users can add players to a game.
 * @param res The HTTP response object
 * @param baseDir The base directory path for the application
 */
export declare function renderEnterNames(res: ServerResponse, baseDir: string): void;
/**
 * Saves a new player name to the current game instance and persists to file.
 * Validates that the name is not empty and doesn't already exist.
 * @param req The HTTP request object
 * @param res The HTTP response object
 * @param baseDir The base directory path for the application
 * @returns void
 * @throws Responds with 400 if name is empty or already exists
 * @throws Responds with 500 if save operation fails
 */
export declare function saveName(req: IncomingMessage, res: ServerResponse, baseDir: string): void;
/**
 * Sets the name for the current game instance without persisting to file.
 * @param req The HTTP request object containing the game name in JSON body
 * @param res The HTTP response object
 * @param baseDir The base directory path for the application
 * @returns void
 * @throws Responds with 400 if name is empty or JSON is invalid
 * @throws Responds with 500 if setName operation fails
 */
export declare function setGameName(req: IncomingMessage, res: ServerResponse, baseDir: string): void;
/**
 * Retrieves all players from the current game instance with their scores.
 * @param res The HTTP response object
 * @param baseDir The base directory path for the application
 * @returns void - Sends JSON array of players with scores
 */
export declare function getPlayers(res: ServerResponse, baseDir: string): void;
/**
 * Retrieves only the player names from the current game (without scores).
 * @param res The HTTP response object
 * @param baseDir The base directory path for the application
 * @returns void - Sends JSON array of player names
 */
export declare function getPlayerNames(res: ServerResponse, baseDir: string): void;
/**
 * Deletes a player from the current game instance and persists changes to file.
 * @param req The HTTP request object containing player name to delete
 * @param res The HTTP response object
 * @param baseDir The base directory path for the application
 * @returns void
 * @throws Responds with 400 if name is empty or JSON is invalid
 * @throws Responds with 404 if player not found
 * @throws Responds with 500 if file operation fails
 */
export declare function deletePlayer(req: IncomingMessage, res: ServerResponse, baseDir: string): void;
/**
 * Updates a player's score by adding the provided amount to their current score.
 * Changes are persisted to file.
 * @param req The HTTP request object containing player name and score delta
 * @param res The HTTP response object
 * @param baseDir The base directory path for the application
 * @returns void
 * @throws Responds with 400 if name or score is missing/invalid
 * @throws Responds with 500 if update fails
 */
export declare function updatePlayerScore(req: IncomingMessage, res: ServerResponse, baseDir: string): void;
/**
 * Sets a player's score to a specific value (replaces current score).
 * Changes are persisted to file.
 * @param req The HTTP request object containing player name and new score value
 * @param res The HTTP response object
 * @param baseDir The base directory path for the application
 * @returns void
 * @throws Responds with 400 if name or score is missing/invalid
 * @throws Responds with 500 if operation fails
 */
export declare function setPlayerScore(req: IncomingMessage, res: ServerResponse, baseDir: string): void;
/**
 * Lists all active games available in the database.
 * Filters out games marked as inactive to show only ongoing games.
 * @param res The HTTP response object
 * @param baseDir The base directory path for the application
 * @returns void - Sends JSON array of game names
 */
export declare function listGames(res: ServerResponse, baseDir: string): void;
/**
 * Persists the current game instance to disk.
 * @param req The HTTP request object
 * @param res The HTTP response object
 * @param baseDir The base directory path for the application
 * @returns void
 * @throws Responds with 500 if save operation fails
 */
export declare function saveGameInstance(req: IncomingMessage, res: ServerResponse, baseDir: string): void;
export declare function addPlayer(req: IncomingMessage, res: ServerResponse, baseDir: string): void;
export declare function markGameInactive(req: IncomingMessage, res: ServerResponse, baseDir: string): void;
export declare function getGameName(res: ServerResponse): void;
//# sourceMappingURL=enterNames.d.ts.map