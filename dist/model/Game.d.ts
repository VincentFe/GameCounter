import Player from "./Player.js";
/**
 * Enum for game types.
 */
export declare enum GameType {
    QUIZ = "quiz",
    CHINEES_POEPEKE = "chinees poepeke"
}
/**
 * Represents a game instance with players, scoring, and game state management.
 * Manages player roster, game type (quiz or chinees poepeke), round tracking, and persistence.
 */
export declare class Game {
    private players;
    private name;
    private active;
    private gameType;
    private round;
    /**
     * Create a new game instance.
     * @param {Player[]} [players=[]] - Initial list of players.
     * @param {string} [name="Default Game"] - The game name.
     * @param {boolean} [active=true] - Whether the game is currently active.
     * @param {GameType} [gameType=GameType.QUIZ] - The type of game (quiz or chinees poepeke).
     * @param {number} [round=1] - The current round number.
     */
    constructor(players?: Player[], name?: string, active?: boolean, gameType?: GameType, round?: number);
    /**
     * Add a player to the game.
     * @param {Player|string} player - A Player instance or player name string.
     */
    addPlayer(player: Player | string): void;
    /**
     * Update a player's score by adding points.
     * @param {string} name - The player's name.
     * @param {number} score - Points to add to their current score.
     */
    updatePlayerScore(name: string, score: number): void;
    /**
     * Set a player's score to a specific value.
     * @param {string} name - The player's name.
     * @param {number} score - The new score value.
     */
    setPlayerScore(name: string, score: number): void;
    /**
     * Get a player's current score.
     * @param {string} name - The player's name.
     * @returns {number} The player's score, or 0 if not found.
     */
    getPlayerScore(name: string): number;
    /**
     * Get all players in the game.
     * @returns {Player[]} Array of Player instances.
     */
    getPlayers(): Player[];
    /**
     * Find the index of a player by name.
     * @param {string} name - The player's name.
     * @returns {number} The player's index, or -1 if not found.
     */
    findPlayerIndexByName(name: string): number;
    /**
     * Remove a player by name.
     * @param {string} name - The player's name.
     * @returns {boolean} True if removed, false if player not found.
     */
    removePlayerByName(name: string): boolean;
    /**
     * Remove all players from the game.
     */
    removeAllPlayers(): void;
    /**
     * Get the current game type.
     * @returns {GameType} The game type (quiz or chinees poepeke).
     */
    getGameType(): GameType;
    /**
     * Set the game type.
     * @param {GameType} type - The game type to set.
     */
    setGameType(type: GameType): void;
    /**
     * Get the current round number.
     * @returns {number} The round number.
     */
    getRound(): number;
    /**
     * Set the current round number.
     * @param {number} round - The round number.
     */
    setRound(round: number): void;
    /**
     * Serialize the game to a JSON object.
     * @returns {Object} A JSON object with name, players, active state, gameType, and round.
     */
    toJSON(): {
        name: string;
        players: any[];
        active: boolean;
        gameType: GameType;
        round: number;
    };
    /**
     * Deserialize a game from a JSON object.
     * @param {any} obj - A JSON object with game data.
     * @returns {Game} A new Game instance.
     */
    static fromJSON(obj: any): Game;
    /**
     * Get all player names as strings.
     * @returns {string[]} Array of player names.
     */
    toPlainNames(): string[];
    /**
     * Get all players with their current scores and history.
     * @returns {any[]} Array of objects with name, score, and history properties.
     */
    toPlayersWithScores(): any[];
    /**
     * Add a value to a player's score history.
     * @param {string} name - The player's name.
     * @param {number} value - The value to add to history.
     */
    addPlayerHistory(name: string, value: number): void;
    /**
     * Get the game name.
     * @returns {string} The game name.
     */
    getGameName(): string;
    /**
     * Set the game name.
     * @param {string} name - The new game name.
     */
    setName(name: string): void;
    /**
     * Set the game's active state.
     * @param {boolean} active - Whether the game is active.
     */
    setActive(active: boolean): void;
    /**
     * Check if the game is active.
     * @returns {boolean} True if the game is active, false otherwise.
     */
    isActive(): boolean;
    /**
     * Save the game to a JSON file in the db directory.
     * Sanitizes the filename to remove invalid characters.
     * @param {string} baseDir - The base directory (__dirname or equivalent).
     * @returns {Promise<void>} A promise that resolves when the file is written.
     */
    saveToFile(baseDir: string): Promise<void>;
}
export default Game;
//# sourceMappingURL=Game.d.ts.map