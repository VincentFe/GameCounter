import fs from "fs/promises";
import path from "path";
import Player from "./Player.js";

export class Game {
  private players: Player[];
  private name: string;

  constructor(players: Player[] = [], name: string = "Default Game") {
    this.players = players;
    this.name = name;
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

  toJSON(): { name: string; players: any[] } {
    return {
      name: this.name,
      players: this.players.map((p) => p.toJSON()),
    };
  }

  static fromJSON(obj: any): Game {
    const players = (obj?.players || []).map(Player.fromJSON);
    const name = obj?.name || "Default Game";
    return new Game(players, name);
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
