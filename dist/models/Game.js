/**
 * Game Model
 * Represents a game session containing multiple players and their scores.
 * Handles player management and game persistence to the file system.
 */
import fs from "fs/promises";
import path from "path";
import Player from "./Player.js";
import { Generator } from "./Generator.js";
import { Result } from "./Result.js";
export class Game {
    /**
     * Creates a new Game instance.
     * @param players Array of players in the game (defaults to empty array)
     * @param name The name of the game (defaults to "Default Game")
     * @param active Whether the game is currently active (defaults to true)
     */
    constructor(players = [], name = "Unnamed Game", active = true) {
        this.players = players;
        this.name = name;
        this.active = active;
    }
    getGuid() {
        return Game.guid;
    }
    /**
     * Adds a player to the game.
     * Accepts either a Player instance or a string name.
     * @param player The player to add (Player object or name string)
     */
    addPlayer(player) {
        const res = this.findPlayerByName(typeof player === "string" ? player : player.name);
        if (res.parmSuccess()) {
            const result = new Result();
            result.parmSuccess(false);
            result.parmErrorMessage("Player with this name already exists.");
            return result;
        }
        const p = player instanceof Player ? player : new Player(player);
        this.players.push(p);
        const result = new Result();
        result.parmSuccess(true);
        return result;
    }
    /**
     * Updates a player's score by adding points.
     * @param name The player's name
     * @param score The number of points to add (can be negative)
     * @returns Result object indicating success or failure with error message if player not found
     */
    updatePlayerScore(name, score) {
        const result = new Result();
        const playerResult = this.findPlayerByName(name);
        if (playerResult.parmSuccess()) {
            const player = playerResult.parmObject();
            player.addScore(score);
            result.parmSuccess(true);
            return result;
        }
        result.parmSuccess(false);
        result.parmErrorMessage("Player not found.");
        return result;
    }
    /**
     * Sets a player's score to a specific value.
     * @param name The player's name
     * @param score The new score value
     * @returns Result object indicating success or failure with error message if player not found
     */
    setPlayerScore(name, score) {
        const result = new Result();
        const playerResult = this.findPlayerByName(name);
        if (playerResult.parmSuccess()) {
            const player = playerResult.parmObject();
            player.setScore(score);
            result.parmSuccess(true);
            return result;
        }
        result.parmSuccess(false);
        result.parmErrorMessage("Player not found.");
        return result;
    }
    /**
     * Retrieves a player's current score.
     * @param name The player's name
     * @returns The player's score, or 0 if player not found
     */
    getPlayerScore(name) {
        const playerResult = this.findPlayerByName(name);
        const result = new Result();
        if (playerResult.parmSuccess()) {
            const player = playerResult.parmObject();
            result.parmSuccess(true);
            result.parmObject(player.getScore());
            return result;
        }
        result.parmSuccess(false);
        result.parmErrorMessage("Player not found.");
        return result;
    }
    /**
     * Retrieves all players in the game.
     * @returns Array of Player objects
     */
    getPlayers() {
        const result = new Result();
        result.parmSuccess(true);
        result.parmObject(this.players);
        return result;
    }
    /**
     * Finds the index of a player by name.
     * @param name The player's name to search for
     * @returns The index of the player, or -1 if not found
     */
    findPlayerByName(name) {
        const result = new Result();
        const player = this.players.find((p) => p.name === name);
        if (!player) {
            result.parmSuccess(false);
            result.parmErrorMessage("Player not found.");
            return result;
        }
        else {
            result.parmSuccess(true);
            result.parmObject(player);
            return result;
        }
    }
    /**
     * Removes a player from the game by name.
     * @param name The player's name to remove
     * @returns Result object indicating success or failure with error message if player not found
     */
    removePlayerByName(name) {
        const result = new Result();
        const playerResult = this.findPlayerByName(name);
        if (!playerResult.parmSuccess()) {
            result.parmSuccess(false);
            result.parmErrorMessage("Player not found.");
            return result;
        }
        const player = playerResult.parmObject();
        const idx = this.players.indexOf(player);
        this.players.splice(idx, 1);
        result.parmSuccess(true);
        return result;
    }
    /**
     * Converts the game to a JSON-serializable object.
     * @returns An object containing the game name, players array, and active status
     */
    toJSON() {
        return {
            name: this.name,
            players: this.players.map((p) => p.toJSON()),
            active: this.active,
        };
    }
    /**
     * Creates a Game instance from a JSON object.
     * @param obj The JSON object to deserialize
     * @returns A new Game instance
     */
    static fromJSON(obj) {
        const players = (obj?.players || []).map(Player.fromJSON);
        const name = obj?.name || "Default Game";
        const active = typeof obj?.active === "boolean" ? obj.active : true;
        return new Game(players, name, active);
    }
    /**
     * Gets an array of just player names.
     * @returns Array of player names
     */
    toPlainNames() {
        const result = new Result();
        result.parmSuccess(true);
        result.parmObject(this.players.map((p) => p.name));
        return result;
    }
    /**
     * Gets an array of players with their names and scores.
     * @returns Array of objects containing name and score for each player
     */
    toPlayersWithScores() {
        const result = new Result();
        result.parmSuccess(true);
        result.parmObject(this.players.map((p) => ({ name: p.name, score: p.getScore() })));
        return result;
    }
    /**
     * Retrieves the game's name.
     * @returns The game name
     */
    getGameName() {
        const result = new Result();
        result.parmSuccess(true);
        result.parmObject(this.name);
        return result;
    }
    /**
     * Sets the game's name.
     * @param name The new name for the game
     * @returns Result object indicating successful completion
     */
    setName(name) {
        const result = new Result();
        this.name = name;
        result.parmSuccess(true);
        return result;
    }
    /**
     * Sets the active status of the game.
     * @param active Whether the game is active
     * @returns Result object indicating successful completion
     */
    setActive(active) {
        const result = new Result();
        this.active = active;
        result.parmSuccess(true);
        return result;
    }
    /**
     * Checks if the game is currently active.
     * @returns true if the game is active, false otherwise
     */
    isActive() {
        const result = new Result();
        result.parmSuccess(true);
        result.parmObject(this.active);
        return result;
    }
    /**
     * Saves the game to a JSON file in the db directory.
     * Sanitizes the filename by removing invalid characters.
     * Creates the db directory if it doesn't exist.
     * @param baseDir The base directory path for the application
     * @returns Promise resolving to Result object indicating success or failure
     */
    async saveToFile(baseDir) {
        const result = new Result();
        try {
            const dbDir = path.join(baseDir, "..", "db");
            // Sanitize filename: remove invalid characters
            const safeName = this.name.replace(/[<>:"|?*\\\/]/g, "_").trim();
            const filename = safeName || "game";
            const filePath = path.join(dbDir, `${filename}.json`);
            await fs.mkdir(dbDir, { recursive: true });
            await fs.writeFile(filePath, JSON.stringify(this.toJSON(), null, 2), "utf8");
            result.parmSuccess(true);
            return result;
        }
        catch (err) {
            result.parmSuccess(false);
            result.parmErrorMessage(`Failed to save game: ${err}`);
            return result;
        }
    }
}
Game.guid = Generator.generateGUID();
export default Game;
//# sourceMappingURL=Game.js.map