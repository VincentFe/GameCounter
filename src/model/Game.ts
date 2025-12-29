import fs from "fs/promises";
import path from "path";
import Player from "./Player.js";

/**
 * Abstract base class for game instances with player management and state.
 * Manages player roster, game name, and active state. Subclasses define game-specific behavior.
 */
export abstract class Game {
  protected players: Player[];
  protected name: string;
  protected active: boolean;

  /**
   * Create a new game instance.
   * @param {Player[]} [players=[]] - Initial list of players.
   * @param {string} [name="Default Game"] - The game name.
   * @param {boolean} [active=true] - Whether the game is currently active.
   */
  constructor(
    players: Player[] = [],
    name: string = "Default Game",
    active: boolean = true
  ) {
    this.players = players;
    this.name = name;
    this.active = active;
  }

  /**
   * Get the game type as a string identifier.
   * @abstract
   * @returns {string} The game type.
   */
  abstract getGameType(): string;

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
   * Get the current round number.
   * @returns {number} The round number.
   */
  getRound(): number {
    return 0; // Default implementation, overridden by ChineesPoepeke
  }

  /**
   * Set the current round number.
   * @param {number} round - The round number.
   */
  setRound(round: number): void {
    // Default implementation, overridden by ChineesPoepeke
  }

  /**
   * Serialize the game to a JSON object.
   * @returns {Object} A JSON object with name, players, active state, and gameType.
   */
  toJSON(): { name: string; players: any[]; active: boolean; gameType: string } {
    return {
      name: this.name,
      players: this.players.map((p) => p.toJSON()),
      active: this.active,
      gameType: this.getGameType(),
    };
  }

  /**
   * Deserialize a game from a JSON object. Routes to appropriate subclass.
   * @param {any} obj - A JSON object with game data.
   * @returns {Game} A new Game subclass instance (Quiz or ChineesPoepeke).
   */
  static fromJSON(obj: any): Game {
    const players = (obj?.players || []).map(Player.fromJSON);
    const name = obj?.name || "Default Game";
    const active = typeof obj?.active === "boolean" ? obj.active : true;
    const gameType = obj?.gameType || "quiz";

    if (gameType === "chinees poepeke") {
      const round = typeof obj?.round === "number" ? obj.round : 1;
      return new ChineesPoepeke(players, name, active, round);
    } else {
      const gameMaster = obj?.gameMaster || "";
      return new Quiz(players, name, active, gameMaster);
    }
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

/**
 * Quiz game type. Extends Game with a gameMaster field.
 */
export class Quiz extends Game {
  private gameMaster: string;

  /**
   * Create a new quiz game.
   * @param {Player[]} [players=[]] - Initial list of players.
   * @param {string} [name="Default Game"] - The game name.
   * @param {boolean} [active=true] - Whether the game is currently active.
   * @param {string} [gameMaster=""] - The quiz master's name.
   */
  constructor(
    players: Player[] = [],
    name: string = "Default Game",
    active: boolean = true,
    gameMaster: string = ""
  ) {
    super(players, name, active);
    this.gameMaster = gameMaster;
  }

  /**
   * Get the game type.
   * @returns {string} Always "quiz".
   */
  getGameType(): string {
    return "quiz";
  }

  /**
   * Get the game master's name.
   * @returns {string} The game master's name.
   */
  getGameMaster(): string {
    return this.gameMaster;
  }

  /**
   * Set the game master's name.
   * @param {string} gameMaster - The game master's name.
   */
  setGameMaster(gameMaster: string): void {
    this.gameMaster = gameMaster;
  }

  /**
   * Serialize the quiz game to a JSON object.
   * @returns {Object} A JSON object with name, players, active state, gameType, and gameMaster.
   */
  toJSON(): { name: string; players: any[]; active: boolean; gameType: string; gameMaster: string } {
    return {
      name: this.name,
      players: this.players.map((p) => p.toJSON()),
      active: this.active,
      gameType: this.getGameType(),
      gameMaster: this.gameMaster,
    };
  }
}

/**
 * Chinees Poepeke game type. Extends Game with a round field.
 */
export class ChineesPoepeke extends Game {
  private round: number;

  /**
   * Create a new chinees poepeke game.
   * @param {Player[]} [players=[]] - Initial list of players.
   * @param {string} [name="Default Game"] - The game name.
   * @param {boolean} [active=true] - Whether the game is currently active.
   * @param {number} [round=1] - The current round number.
   */
  constructor(
    players: Player[] = [],
    name: string = "Default Game",
    active: boolean = true,
    round: number = 1
  ) {
    super(players, name, active);
    this.round = round;
  }

  /**
   * Get the game type.
   * @returns {string} Always "chinees poepeke".
   */
  getGameType(): string {
    return "chinees poepeke";
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
   * Serialize the chinees poepeke game to a JSON object.
   * @returns {Object} A JSON object with name, players, active state, gameType, and round.
   */
  toJSON(): { name: string; players: any[]; active: boolean; gameType: string; round: number } {
    return {
      name: this.name,
      players: this.players.map((p) => p.toJSON()),
      active: this.active,
      gameType: this.getGameType(),
      round: this.round,
    };
  }
}

export default Game;
