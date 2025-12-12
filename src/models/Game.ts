import fs from "fs/promises";
import path from "path";
import Player from "./Player.js";

export class Game {
  private players: Player[];

  constructor(players: Player[] = []) {
    this.players = players;
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

  toJSON(): { players: any[] } {
    return { players: this.players.map((p) => p.toJSON()) };
  }

  static fromJSON(obj: any): Game {
    const players = (obj?.players || []).map(Player.fromJSON);
    return new Game(players);
  }

  toPlainNames(): string[] {
    return this.players.map((p) => p.name);
  }

  toPlayersWithScores(): any[] {
    return this.players.map((p) => ({ name: p.name, score: p.getScore() }));
  }

  static async loadFromFile(baseDir: string): Promise<Game> {
    const filePath = path.join(baseDir, "..", "db", "names.txt");
    try {
      const data = await fs.readFile(filePath, "utf8");
      const players = data
        ? data
            .split("\\n")
            .map((x) => x.trim())
            .filter(Boolean)
            .map((n) => new Player(n))
        : [];
      return new Game(players);
    } catch (e) {
      return new Game();
    }
  }

  async saveToFile(baseDir: string): Promise<void> {
    const dbDir = path.join(baseDir, "..", "db");
    const filePath = path.join(dbDir, "names.txt");
    const toWrite = this.players.length
      ? this.toPlainNames().join("\n") + "\n"
      : "";
    await fs.mkdir(dbDir, { recursive: true });
    await fs.writeFile(filePath, toWrite, "utf8");
  }
}

export default Game;
