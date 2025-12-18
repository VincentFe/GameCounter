/**
 * Player Model
 * Represents a player in the game with a name and score.
 */

export class Player {
  name: string;
  score: number;

  /**
   * Creates a new Player instance.
   * @param name The player's name
   * @param score The player's initial score (defaults to 0)
   */
  constructor(name: string, score: number = 0) {
    this.name = (name || "").toString();
    this.score = typeof score === "number" ? score : 0;
  }

  /**
   * Adds points to the player's current score.
   * @param points The number of points to add
   */
  addScore(points: number): void {
    this.score += points;
  }

  /**
   * Sets the player's score to a specific value.
   * @param score The new score value
   */
  setScore(score: number): void {
    this.score = score;
  }

  /**
   * Retrieves the player's current score.
   * @returns The player's score
   */
  getScore(): number {
    return this.score;
  }

  /**
   * Converts the player to a JSON-serializable object.
   * @returns An object containing the player's name and score
   */
  toJSON(): { name: string; score: number } {
    return { name: this.name, score: this.score };
  }

  /**
   * Creates a Player instance from a JSON object or string.
   * @param obj The JSON object or string to deserialize
   * @returns A new Player instance
   */
  static fromJSON(obj: any): Player {
    if (!obj) return new Player("");
    if (typeof obj === "string") return new Player(obj);
    return new Player(obj.name || "", obj.score || 0);
  }

  /**
   * Returns the player's name as a string.
   * @returns The player's name
   */
  toString(): string {
    return this.name;
  }
}

export default Player;
