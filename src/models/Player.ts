export class Player {
  name: string;
  score: number;

  constructor(name: string, score: number = 0) {
    this.name = (name || "").toString();
    this.score = typeof score === "number" ? score : 0;
  }

  addScore(points: number): void {
    this.score += points;
  }

  setScore(score: number): void {
    this.score = score;
  }

  getScore(): number {
    return this.score;
  }

  toJSON(): { name: string; score: number } {
    return { name: this.name, score: this.score };
  }

  static fromJSON(obj: any): Player {
    if (!obj) return new Player("");
    if (typeof obj === "string") return new Player(obj);
    return new Player(obj.name || "", obj.score || 0);
  }

  toString(): string {
    return this.name;
  }
}

export default Player;
