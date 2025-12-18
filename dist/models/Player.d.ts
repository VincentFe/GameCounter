/**
 * Player Model
 * Represents a player in the game with a name and score.
 */
export declare class Player {
    name: string;
    score: number;
    /**
     * Creates a new Player instance.
     * @param name The player's name
     * @param score The player's initial score (defaults to 0)
     */
    constructor(name: string, score?: number);
    /**
     * Adds points to the player's current score.
     * @param points The number of points to add
     */
    addScore(points: number): void;
    /**
     * Sets the player's score to a specific value.
     * @param score The new score value
     */
    setScore(score: number): void;
    /**
     * Retrieves the player's current score.
     * @returns The player's score
     */
    getScore(): number;
    /**
     * Converts the player to a JSON-serializable object.
     * @returns An object containing the player's name and score
     */
    toJSON(): {
        name: string;
        score: number;
    };
    /**
     * Creates a Player instance from a JSON object or string.
     * @param obj The JSON object or string to deserialize
     * @returns A new Player instance
     */
    static fromJSON(obj: any): Player;
    /**
     * Returns the player's name as a string.
     * @returns The player's name
     */
    toString(): string;
}
export default Player;
//# sourceMappingURL=Player.d.ts.map