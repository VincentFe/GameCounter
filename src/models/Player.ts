export class Player {
  name: string;
  score: number;
  history: number[];

  constructor(name: string, score: number = 0, history: number[] = []) {
    this.name = (name || "").toString();
    this.score = typeof score === "number" ? score : 0;
    this.history = Array.isArray(history) ? history.map((v) => Number(v) || 0) : [];
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

  toJSON(): { name: string; score: number; history?: number[] } {
    return { name: this.name, score: this.score, history: this.history };
  }

  static fromJSON(obj: any): Player {
    if (!obj) return new Player("");
    if (typeof obj === "string") return new Player(obj);
    return new Player(obj.name || "", obj.score || 0, obj.history || []);
  }

  addHistory(value: number): void {
    if (!this.history) this.history = [];
    this.history.push(typeof value === "number" ? value : Number(value) || 0);
  }

  getHistory(): number[] {
    return this.history || [];
  }

  toString(): string {
    return this.name;
  }
}

export default Player;
