import Player from "./Player.js";
import Group from "./Group.js";
/**
 * Abstract base class for game instances with player management and state.
 * Manages player roster, game name, password, and active state. Subclasses define game-specific behavior.
 */
export declare abstract class Game {
    protected id: string;
    protected players: Player[];
    protected groups: Group[];
    protected useGroups: boolean;
    protected name: string;
    protected password: string;
    protected active: boolean;
    /**
     * Create a new game instance.
     * @param {Player[]} [players=[]] - Initial list of players.
     * @param {string} [name="Default Game"] - The game name.
     * @param {boolean} [active=true] - Whether the game is currently active.
     * @param {string} [password=""] - Optional game password.
     * @param {string} [id] - Optional GUID. If not provided, one is generated.
     */
    constructor(players?: Player[], name?: string, active?: boolean, password?: string, id?: string, groups?: Group[], useGroups?: boolean);
    /**
     * Get the game type as a string identifier.
     * @abstract
     * @returns {string} The game type.
     */
    abstract getGameType(): string;
    /**
     * Get the game's GUID.
     * @returns {string} The game's unique identifier.
     */
    getId(): string;
    /**
     * Get the game's password.
     * @returns {string} The game's password.
     */
    getPassword(): string;
    /**
     * Set the game's password.
     * @param {string} password - The new password.
     */
    setPassword(password: string): void;
    /**
     * Verify a password against the game's password.
     * @param {string} password - The password to verify.
     * @returns {boolean} True if the password matches, false otherwise.
     */
    verifyPassword(password: string): boolean;
    /**
     * Add a player to the game.
     * @param {Player|string} player - A Player instance or player name string.
     */
    addPlayer(player: Player | string): void;
    addGroup(group: Group | string): void;
    getGroups(): Group[];
    removeGroupById(id: string): boolean;
    usesGroups(): boolean;
    setUseGroups(flag: boolean): void;
    /**
     * Replace all groups on this game.
     * @param {Group[]} groups
     */
    setGroups(groups: Group[]): void;
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
     * Get the current round number.
     * Default implementation, overridden by ChineesPoepeke
     */
    getRound(): number;
    /**
     * Set the current round number.
     * Default implementation, overridden by ChineesPoepeke
     */
    setRound(round: number): void;
    /**
     * Serialize the game to a JSON object.
     */
    toJSON(): {
        id: string;
        name: string;
        players: any[];
        groups: any[];
        useGroups: boolean;
        password: string;
        active: boolean;
        gameType: string;
    };
    /**
     * Deserialize a game from JSON and return the appropriate subclass.
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
/**
 * Quiz game type. Extends Game with a grandmasterId field.
 */
export declare class Quiz extends Game {
    private grandmasterId;
    /**
     * Create a new quiz game.
     * @param {Player[]} [players=[]] - Initial list of players.
     * @param {string} [name="Default Game"] - The game name.
     * @param {boolean} [active=true] - Whether the game is currently active.
     * @param {string} [password=""] - Optional game password.
     * @param {string} [id] - Optional GUID. If not provided, one is generated.
     * @param {string} [grandmasterId=""] - The GUID of the grandmaster.
     */
    constructor(players?: Player[], name?: string, active?: boolean, password?: string, id?: string, grandmasterId?: string, groups?: Group[], useGroups?: boolean);
    /**
     * Get the game type.
     * @returns {string} Always "quiz".
     */
    getGameType(): string;
    /**
     * Get the grandmaster's GUID.
     * @returns {string} The grandmaster's GUID.
     */
    getGrandmasterId(): string;
    /**
     * Set the grandmaster's GUID.
     * @param {string} grandmasterId - The grandmaster's GUID.
     */
    setGrandmasterId(grandmasterId: string): void;
    /**
     * Serialize the quiz game to a JSON object.
     * @returns {Object} A JSON object with all game properties including grandmasterId.
     */
    toJSON(): {
        id: string;
        name: string;
        players: any[];
        groups: any[];
        useGroups: boolean;
        password: string;
        active: boolean;
        gameType: string;
        grandmasterId: string;
    };
}
/**
 * Chinees Poepeke game type. Extends Game with a round field.
 */
export declare class ChineesPoepeke extends Game {
    private round;
    /**
     * Create a new chinees poepeke game.
     * @param {Player[]} [players=[]] - Initial list of players.
     * @param {string} [name="Default Game"] - The game name.
     * @param {boolean} [active=true] - Whether the game is currently active.
     * @param {string} [password=""] - Optional game password.
     * @param {string} [id] - Optional GUID. If not provided, one is generated.
     * @param {number} [round=1] - The current round number.
     */
    constructor(players?: Player[], name?: string, active?: boolean, password?: string, id?: string, round?: number);
    /**
     * Get the game type.
     * @returns {string} Always "chinees poepeke".
     */
    getGameType(): string;
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
     * Serialize the chinees poepeke game to a JSON object.
     * @returns {Object} A JSON object with all game properties including round.
     */
    toJSON(): {
        id: string;
        name: string;
        players: any[];
        groups: any[];
        useGroups: boolean;
        password: string;
        active: boolean;
        gameType: string;
        round: number;
    };
}
export default Game;
//# sourceMappingURL=Game.d.ts.map