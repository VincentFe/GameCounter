import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import Player from "./Player.js";
import Group from "./Group.js";

/**
 * Generates a 16-character GUID.
 * @returns {string} A random 16-character GUID.
 */
function generateGUID(): string {
  return crypto.randomBytes(8).toString("hex");
}

/**
 * Abstract base class for game instances with player management and state.
 * Manages player roster, game name, password, and active state. Subclasses define game-specific behavior.
 */
export abstract class Game {
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
  constructor(
    players: Player[] = [],
    name: string = "Default Game",
    active: boolean = true,
    password: string = "",
    id?: string,
    groups: Group[] = [],
    useGroups: boolean = false
  ) {
    this.id = id || generateGUID();
    this.players = players;
    this.groups = groups;
    this.useGroups = !!useGroups;
    this.name = name;
    this.password = password;
    this.active = active;
  }

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
  getId(): string {
    return this.id;
  }

  /**
   * Get the game's password.
   * @returns {string} The game's password.
   */
  getPassword(): string {
    return this.password;
  }

  /**
   * Set the game's password.
   * @param {string} password - The new password.
   */
  setPassword(password: string): void {
    this.password = password || "";
  }

  /**
   * Verify a password against the game's password.
   * @param {string} password - The password to verify.
   * @returns {boolean} True if the password matches, false otherwise.
   */
  verifyPassword(password: string): boolean {
    return this.password === password;
  }

  /**
   * Add a player to the game.
   * @param {Player|string} player - A Player instance or player name string.
   */
  addPlayer(player: Player | string): void {
    const p = player instanceof Player ? player : new Player(player as string);
    this.players.push(p);
  }

  addGroup(group: Group | string): void {
    const g = group instanceof Group ? group : new Group(String(group));
    this.groups.push(g);
  }

  getGroups(): Group[] {
    return this.groups;
  }

  removeGroupById(id: string): boolean {
    const idx = this.groups.findIndex((g) => g.id === id);
    if (idx === -1) return false;
    this.groups.splice(idx, 1);
    return true;
  }

  usesGroups(): boolean {
    return !!this.useGroups;
  }

  setUseGroups(flag: boolean): void {
    this.useGroups = !!flag;
  }

  /**
   * Replace all groups on this game.
   * @param {Group[]} groups
   */
  setGroups(groups: Group[]): void {
    this.groups = Array.isArray(groups) ? groups : [];
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
   * Default implementation, overridden by ChineesPoepeke
   */
  getRound(): number {
    return 0;
  }

  /**
   * Set the current round number.
   * Default implementation, overridden by ChineesPoepeke
   */
  setRound(round: number): void {
    // no-op
  }

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
  } {
    return {
      id: this.id,
      name: this.name,
      players: this.players.map((p) => (typeof (p as any)?.toJSON === "function" ? (p as any).toJSON() : { name: p.name })),
      groups: (this.groups || []).map((g) => (typeof (g as any)?.toJSON === "function" ? (g as any).toJSON() : { name: g.name })),
      useGroups: !!this.useGroups,
      password: this.password,
      active: this.active,
      gameType: this.getGameType(),
    };
  }

  /**
   * Deserialize a game from JSON and return the appropriate subclass.
   */
  static fromJSON(obj: any): Game {
    const players = (obj?.players || []).map((p: any) => Player.fromJSON(p));
    const groups = (obj?.groups || []).map((g: any) => Group.fromJSON(g));
    const name = obj?.name || "Default Game";
    const active = typeof obj?.active === "boolean" ? obj.active : true;
    const password = obj?.password || "";
    const id = obj?.id;
    const gameType = obj?.gameType || "quiz";
    const useGroups = !!obj?.useGroups;

    if (gameType === "chinees poepeke") {
      const round = typeof obj?.round === "number" ? obj.round : 1;
      return new ChineesPoepeke(players, name, active, password, id, round);
    } else {
      const grandmasterId = obj?.grandmasterId || "";
      return new Quiz(players, name, active, password, id, grandmasterId, groups, useGroups);
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
 * Quiz game type. Extends Game with a grandmasterId field.
 */
export class Quiz extends Game {
  private grandmasterId: string;

  /**
   * Create a new quiz game.
   * @param {Player[]} [players=[]] - Initial list of players.
   * @param {string} [name="Default Game"] - The game name.
   * @param {boolean} [active=true] - Whether the game is currently active.
   * @param {string} [password=""] - Optional game password.
   * @param {string} [id] - Optional GUID. If not provided, one is generated.
   * @param {string} [grandmasterId=""] - The GUID of the grandmaster.
   */
  constructor(
    players: Player[] = [],
    name: string = "Default Game",
    active: boolean = true,
    password: string = "",
    id?: string,
    grandmasterId: string = "",
    groups: Group[] = [],
    useGroups: boolean = false
  ) {
    super(players, name, active, password, id, groups, useGroups);
    this.grandmasterId = grandmasterId;
  }

  /**
   * Get the game type.
   * @returns {string} Always "quiz".
   */
  getGameType(): string {
    return "quiz";
  }

  /**
   * Get the grandmaster's GUID.
   * @returns {string} The grandmaster's GUID.
   */
  getGrandmasterId(): string {
    return this.grandmasterId;
  }

  /**
   * Set the grandmaster's GUID.
   * @param {string} grandmasterId - The grandmaster's GUID.
   */
  setGrandmasterId(grandmasterId: string): void {
    this.grandmasterId = grandmasterId;
  }

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
  } {
    return {
      id: this.id,
      name: this.name,
      players: this.players.map((p) => (typeof (p as any)?.toJSON === "function" ? (p as any).toJSON() : { name: p.name })),
      groups: (this.groups || []).map((g) => (typeof (g as any)?.toJSON === "function" ? (g as any).toJSON() : { name: g.name })),
      useGroups: !!this.useGroups,
      password: this.password,
      active: this.active,
      gameType: this.getGameType(),
      grandmasterId: this.grandmasterId,
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
   * @param {string} [password=""] - Optional game password.
   * @param {string} [id] - Optional GUID. If not provided, one is generated.
   * @param {number} [round=1] - The current round number.
   */
  constructor(
    players: Player[] = [],
    name: string = "Default Game",
    active: boolean = true,
    password: string = "",
    id?: string,
    round: number = 1
  ) {
    super(players, name, active, password, id);
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
  } {
    return {
      id: this.id,
      name: this.name,
      players: this.players.map((p) => (typeof (p as any)?.toJSON === "function" ? (p as any).toJSON() : { name: p.name })),
      groups: (this.groups || []).map((g) => (typeof (g as any)?.toJSON === "function" ? (g as any).toJSON() : { name: g.name })),
      useGroups: !!this.useGroups,
      password: this.password,
      active: this.active,
      gameType: this.getGameType(),
      round: this.round,
    };
  }
}

export default Game;
