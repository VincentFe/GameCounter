export class Player {
    constructor(name, score = 0, history = []) {
        this.name = (name || "").toString();
        this.score = typeof score === "number" ? score : 0;
        this.history = Array.isArray(history) ? history.map((v) => Number(v) || 0) : [];
    }
    addScore(points) {
        this.score += points;
    }
    setScore(score) {
        this.score = score;
    }
    getScore() {
        return this.score;
    }
    toJSON() {
        return { name: this.name, score: this.score, history: this.history };
    }
    static fromJSON(obj) {
        if (!obj)
            return new Player("");
        if (typeof obj === "string")
            return new Player(obj);
        return new Player(obj.name || "", obj.score || 0, obj.history || []);
    }
    addHistory(value) {
        if (!this.history)
            this.history = [];
        this.history.push(typeof value === "number" ? value : Number(value) || 0);
    }
    getHistory() {
        return this.history || [];
    }
    toString() {
        return this.name;
    }
}
export default Player;
//# sourceMappingURL=Player.js.map