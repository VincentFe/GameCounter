/**
 * Represents a player in a game with score tracking and history.
 */
export class Player {
  name: string;
  score: number;
  history: number[];

  /**
   * Create a new player instance.
   * @param {string} name - The player's name.
   * @param {number} [score=0] - Initial score (default: 0).
   * @param {number[]} [history=[]] - Array of historical score values (default: empty array).
   */
  constructor(name: string, score: number = 0, history: number[] = []) {
    this.name = (name || "").toString();
    this.score = typeof score === "number" ? score : 0;
    this.history = Array.isArray(history) ? history.map((v) => Number(v) || 0) : [];
  }

  /**
   * Add points to the player's current score.
   * @param {number} points - The number of points to add.
   */
  addScore(points: number): void {
    this.score += points;
  }

  /**
   * Set the player's score to a specific value.
   * @param {number} score - The new score value.
   */
  setScore(score: number): void {
    this.score = score;
  }

  /**
   * Get the player's current score.
   * @returns {number} The player's score.
   */
  getScore(): number {
    return this.score;
  }

  /**
   * Serialize the player to a JSON object.
   * @returns {Object} A JSON object with name, score, and optional history.
   */
  toJSON(): { name: string; score: number; history?: number[] } {
    return { name: this.name, score: this.score, history: this.history };
  }

  /**
   * Deserialize a player from a JSON object or string.
   * @param {any} obj - A JSON object with player data or a string name.
   * @returns {Player} A new Player instance.
   */
  static fromJSON(obj: any): Player {
    if (!obj) return new Player("");
    if (typeof obj === "string") return new Player(obj);
    return new Player(obj.name || "", obj.score || 0, obj.history || []);
  }

  /**
   * Add a value to the player's history.
   * @param {number} value - The value to add to history.
   */
  addHistory(value: number): void {
    if (!this.history) this.history = [];
    this.history.push(typeof value === "number" ? value : Number(value) || 0);
  }

  /**
   * Get the player's score history.
   * @returns {number[]} Array of historical score values.
   */
  getHistory(): number[] {
    return this.history || [];
  }

  /**
   * Get a string representation of the player (their name).
   * @returns {string} The player's name.
   */
  toString(): string {
    return this.name;
  }
}

export default Player;
