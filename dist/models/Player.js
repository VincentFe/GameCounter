export class Player {
    constructor(name, score = 0) {
        this.name = (name || "").toString();
        this.score = typeof score === "number" ? score : 0;
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
        return { name: this.name, score: this.score };
    }
    static fromJSON(obj) {
        if (!obj)
            return new Player("");
        if (typeof obj === "string")
            return new Player(obj);
        return new Player(obj.name || "", obj.score || 0);
    }
    toString() {
        return this.name;
    }
}
export default Player;
//# sourceMappingURL=Player.js.map