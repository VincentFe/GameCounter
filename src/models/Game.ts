import fs from "fs/promises";
import path from "path";
import Player from "./Player.js";

export enum GameType {
  QUIZ = "quiz",
  CHINEES_POEPEKE = "chinees poepeke",
}

export class Game {
  private players: Player[];
  private name: string;
  private active: boolean;
  private gameType: GameType;

  constructor(
    players: Player[] = [],
    name: string = "Default Game",
    active: boolean = true,
    gameType: GameType = GameType.QUIZ
  ) {
    this.players = players;
    this.name = name;
    this.active = active;
    this.gameType = gameType;
  }

  addPlayer(player: Player | string): void {
    const p = player instanceof Player ? player : new Player(player as string);
    this.players.push(p);
  }

  updatePlayerScore(name: string, score: number): void {
    const idx = this.findPlayerIndexByName(name);
    if (idx !== -1) {
      this.players[idx].addScore(score);
    }
  }

  setPlayerScore(name: string, score: number): void {
    const idx = this.findPlayerIndexByName(name);
    if (idx !== -1) {
      this.players[idx].setScore(score);
    }
  }

  getPlayerScore(name: string): number {
    const idx = this.findPlayerIndexByName(name);
    return idx !== -1 ? this.players[idx].getScore() : 0;
  }

  getPlayers(): Player[] {
    return this.players;
  }

  findPlayerIndexByName(name: string): number {
    return this.players.findIndex((p) => p.name === name);
  }

  removePlayerByName(name: string): boolean {
    const idx = this.findPlayerIndexByName(name);
    if (idx === -1) return false;
    this.players.splice(idx, 1);
    return true;
  }

  removeAllPlayers(): void {
    this.players = [];
  }

  getGameType(): GameType {
    return this.gameType;
  }

  setGameType(type: GameType): void {
    this.gameType = type;
  }

  toJSON(): { name: string; players: any[]; active: boolean; gameType: GameType } {
    return {
      name: this.name,
      players: this.players.map((p) => p.toJSON()),
      active: this.active,
      gameType: this.gameType,
    };
  }

  static fromJSON(obj: any): Game {
    const players = (obj?.players || []).map(Player.fromJSON);
    const name = obj?.name || "Default Game";
    const active = typeof obj?.active === "boolean" ? obj.active : true;
    const gameType = (obj?.gameType as GameType) || GameType.QUIZ;
    return new Game(players, name, active, gameType);
  }

  toPlainNames(): string[] {
    return this.players.map((p) => p.name);
  }

  toPlayersWithScores(): any[] {
    return this.players.map((p) => ({ name: p.name, score: p.getScore() }));
  }

  getGameName(): string {
    return this.name;
  }

  setName(name: string): void {
    this.name = name;
  }

  setActive(active: boolean): void {
    this.active = active;
  }

  isActive(): boolean {
    return this.active;
  }

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
