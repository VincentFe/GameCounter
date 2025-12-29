import fs from "fs/promises";
import path from "path";
import Player from "./Player.js";

/**
 * Enum for game types.
 */
export enum GameType {
  QUIZ = "quiz",
  CHINEES_POEPEKE = "chinees poepeke",
}

/**
 * Represents a game instance with players, scoring, and game state management.
 * Manages player roster, game type (quiz or chinees poepeke), round tracking, and persistence.
 */
export class Game {
  private players: Player[];
  private name: string;
  private active: boolean;
  private gameType: GameType;
  private round: number;

  /**
   * Create a new game instance.
   * @param {Player[]} [players=[]] - Initial list of players.
   * @param {string} [name="Default Game"] - The game name.
   * @param {boolean} [active=true] - Whether the game is currently active.
   * @param {GameType} [gameType=GameType.QUIZ] - The type of game (quiz or chinees poepeke).
   * @param {number} [round=1] - The current round number.
   */
  constructor(
    players: Player[] = [],
    name: string = "Default Game",
    active: boolean = true,
    gameType: GameType = GameType.QUIZ,
    round: number = 1
  ) {
    this.players = players;
    this.name = name;
    this.active = active;
    this.gameType = gameType;
    this.round = round;
  }

  /**
   * Add a player to the game.
   * @param {Player|string} player - A Player instance or player name string.
   */
  addPlayer(player: Player | string): void {
    const p = player instanceof Player ? player : new Player(player as string);
    this.players.push(p);
  }

  /**
   * Update a player's score by adding points.
   * @param {string} name - The player's name.
   * @param {number} score - Points to add to their current score.
   */
  updatePlayerScore(name: string, score: number): void {
    const idx = this.findPlayerIndexByName(name);
    if (idx !== -1) {
      this.players[idx].addScore(score);
    }
  }

  /**
   * Set a player's score to a specific value.
   * @param {string} name - The player's name.
   * @param {number} score - The new score value.
   */
  setPlayerScore(name: string, score: number): void {
    const idx = this.findPlayerIndexByName(name);
    if (idx !== -1) {
      this.players[idx].setScore(score);
    }
  }

  /**
   * Get a player's current score.
   * @param {string} name - The player's name.
   * @returns {number} The player's score, or 0 if not found.
   */
  getPlayerScore(name: string): number {
    const idx = this.findPlayerIndexByName(name);
    return idx !== -1 ? this.players[idx].getScore() : 0;
  }

  /**
   * Get all players in the game.
   * @returns {Player[]} Array of Player instances.
   */
  getPlayers(): Player[] {
    return this.players;
  }

  /**
   * Find the index of a player by name.
   * @param {string} name - The player's name.
   * @returns {number} The player's index, or -1 if not found.
   */
  findPlayerIndexByName(name: string): number {
    return this.players.findIndex((p) => p.name === name);
  }

  /**
   * Remove a player by name.
   * @param {string} name - The player's name.
   * @returns {boolean} True if removed, false if player not found.
   */
  removePlayerByName(name: string): boolean {
    const idx = this.findPlayerIndexByName(name);
    if (idx === -1) return false;
    this.players.splice(idx, 1);
    return true;
  }

  /**
   * Remove all players from the game.
   */
  removeAllPlayers(): void {
    this.players = [];
  }

  /**
   * Get the current game type.
   * @returns {GameType} The game type (quiz or chinees poepeke).
   */
  getGameType(): GameType {
    return this.gameType;
  }

  /**
   * Set the game type.
   * @param {GameType} type - The game type to set.
   */
  setGameType(type: GameType): void {
    this.gameType = type;
  }

  /**
   * Get the current round number.
   * @returns {number} The round number.
   */
  getRound(): number {
    return this.round;
  }

  /**
   * Set the current round number.
   * @param {number} round - The round number.
   */
  setRound(round: number): void {
    this.round = round;
  }

  /**
   * Serialize the game to a JSON object.
   * @returns {Object} A JSON object with name, players, active state, gameType, and round.
   */
  toJSON(): { name: string; players: any[]; active: boolean; gameType: GameType; round: number } {
    return {
      name: this.name,
      players: this.players.map((p) => p.toJSON()),
      active: this.active,
      gameType: this.gameType,
      round: this.round,
    };
  }

  /**
   * Deserialize a game from a JSON object.
   * @param {any} obj - A JSON object with game data.
   * @returns {Game} A new Game instance.
   */
  static fromJSON(obj: any): Game {
    const players = (obj?.players || []).map(Player.fromJSON);
    const name = obj?.name || "Default Game";
    const active = typeof obj?.active === "boolean" ? obj.active : true;
    const gameType = (obj?.gameType as GameType) || GameType.QUIZ;
    const round = typeof obj?.round === "number" ? obj.round : 1;
    return new Game(players, name, active, gameType, round);
  }

  /**
   * Get all player names as strings.
   * @returns {string[]} Array of player names.
   */
  toPlainNames(): string[] {
    return this.players.map((p) => p.name);
  }

  /**
   * Get all players with their current scores and history.
   * @returns {any[]} Array of objects with name, score, and history properties.
   */
  toPlayersWithScores(): any[] {
    return this.players.map((p) => ({ name: p.name, score: p.getScore(), history: (p as any).history || [] }));
  }

  /**
   * Add a value to a player's score history.
   * @param {string} name - The player's name.
   * @param {number} value - The value to add to history.
   */
  addPlayerHistory(name: string, value: number): void {
    const idx = this.findPlayerIndexByName(name);
    if (idx !== -1) {
      const player = this.players[idx] as any;
      if (!Array.isArray(player.history)) player.history = [];
      player.history.push(typeof value === "number" ? value : Number(value) || 0);
    }
  }

  /**
   * Get the game name.
   * @returns {string} The game name.
   */
  getGameName(): string {
    return this.name;
  }

  /**
   * Set the game name.
   * @param {string} name - The new game name.
   */
  setName(name: string): void {
    this.name = name;
  }

  /**
   * Set the game's active state.
   * @param {boolean} active - Whether the game is active.
   */
  setActive(active: boolean): void {
    this.active = active;
  }

  /**
   * Check if the game is active.
   * @returns {boolean} True if the game is active, false otherwise.
   */
  isActive(): boolean {
    return this.active;
  }

  /**
   * Save the game to a JSON file in the db directory.
   * Sanitizes the filename to remove invalid characters.
   * @param {string} baseDir - The base directory (__dirname or equivalent).
   * @returns {Promise<void>} A promise that resolves when the file is written.
   */
  async saveToFile(baseDir: string): Promise<void> {
    const dbDir = path.join(baseDir, "..", "db");
    // Sanitize filename: remove invalid characters
    const safeName = this.name.replace(/[<>:"|?*\\\/]/g, "_").trim();
    const filename = safeName || "game";
    const filePath = path.join(dbDir, `${filename}.json`);
    await fs.mkdir(dbDir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(this.toJSON(), null, 2), "utf8");
  }
}

export default Game;
