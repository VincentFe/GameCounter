/**
 * Game Model
 * Represents a game session containing multiple players and their scores.
 * Handles player management and game persistence to the file system.
 */
import Player from "./Player.js";
import { Result } from "./Result.js";
export declare class Game {
    private players;
    private name;
    private active;
    private static guid;
    /**
     * Creates a new Game instance.
     * @param players Array of players in the game (defaults to empty array)
     * @param name The name of the game (defaults to "Default Game")
     * @param active Whether the game is currently active (defaults to true)
     */
    constructor(players?: Player[], name?: string, active?: boolean);
    getGuid(): string;
    /**
     * Adds a player to the game.
     * Accepts either a Player instance or a string name.
     * @param player The player to add (Player object or name string)
     */
    addPlayer(player: Player | string): Result;
    /**
     * Updates a player's score by adding points.
     * @param name The player's name
     * @param score The number of points to add (can be negative)
     * @returns Result object indicating success or failure with error message if player not found
     */
    updatePlayerScore(name: string, score: number): Result;
    /**
     * Sets a player's score to a specific value.
     * @param name The player's name
     * @param score The new score value
     * @returns Result object indicating success or failure with error message if player not found
     */
    setPlayerScore(name: string, score: number): Result;
    /**
     * Retrieves a player's current score.
     * @param name The player's name
     * @returns The player's score, or 0 if player not found
     */
    getPlayerScore(name: string): Result;
    /**
     * Retrieves all players in the game.
     * @returns Array of Player objects
     */
    getPlayers(): Result;
    /**
     * Finds the index of a player by name.
     * @param name The player's name to search for
     * @returns The index of the player, or -1 if not found
     */
    findPlayerByName(name: string): Result;
    /**
     * Removes a player from the game by name.
     * @param name The player's name to remove
     * @returns Result object indicating success or failure with error message if player not found
     */
    removePlayerByName(name: string): Result;
    /**
     * Converts the game to a JSON-serializable object.
     * @returns An object containing the game name, players array, and active status
     */
    toJSON(): {
        name: string;
        players: any[];
        active: boolean;
    };
    /**
     * Creates a Game instance from a JSON object.
     * @param obj The JSON object to deserialize
     * @returns A new Game instance
     */
    static fromJSON(obj: any): Game;
    /**
     * Gets an array of just player names.
     * @returns Array of player names
     */
    toPlainNames(): Result;
    /**
     * Gets an array of players with their names and scores.
     * @returns Array of objects containing name and score for each player
     */
    toPlayersWithScores(): Result;
    /**
     * Retrieves the game's name.
     * @returns The game name
     */
    getGameName(): Result;
    /**
     * Sets the game's name.
     * @param name The new name for the game
     * @returns Result object indicating successful completion
     */
    setName(name: string): Result;
    /**
     * Sets the active status of the game.
     * @param active Whether the game is active
     * @returns Result object indicating successful completion
     */
    setActive(active: boolean): Result;
    /**
     * Checks if the game is currently active.
     * @returns true if the game is active, false otherwise
     */
    isActive(): Result;
    /**
     * Saves the game to a JSON file in the db directory.
     * Sanitizes the filename by removing invalid characters.
     * Creates the db directory if it doesn't exist.
     * @param baseDir The base directory path for the application
     * @returns Promise resolving to Result object indicating success or failure
     */
    saveToFile(baseDir: string): Promise<Result>;
}
export default Game;
//# sourceMappingURL=Game.d.ts.map