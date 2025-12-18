import fs from "fs/promises";
import path from "path";
import Player from "./Player.js";
export class Game {
    constructor(players = [], name = "Default Game") {
        this.players = players;
        this.name = name;
    }
    addPlayer(player) {
        const p = player instanceof Player ? player : new Player(player);
        this.players.push(p);
    }
    updatePlayerScore(name, score) {
        const idx = this.findPlayerIndexByName(name);
        if (idx !== -1) {
            this.players[idx].addScore(score);
        }
    }
    setPlayerScore(name, score) {
        const idx = this.findPlayerIndexByName(name);
        if (idx !== -1) {
            this.players[idx].setScore(score);
        }
    }
    getPlayerScore(name) {
        const idx = this.findPlayerIndexByName(name);
        return idx !== -1 ? this.players[idx].getScore() : 0;
    }
    getPlayers() {
        return this.players;
    }
    findPlayerIndexByName(name) {
        return this.players.findIndex((p) => p.name === name);
    }
    removePlayerByName(name) {
        const idx = this.findPlayerIndexByName(name);
        if (idx === -1)
            return false;
        this.players.splice(idx, 1);
        return true;
    }
    toJSON() {
        return {
            name: this.name,
            players: this.players.map((p) => p.toJSON()),
        };
    }
    static fromJSON(obj) {
        const players = (obj?.players || []).map(Player.fromJSON);
        const name = obj?.name || "Default Game";
        return new Game(players, name);
    }
    toPlainNames() {
        return this.players.map((p) => p.name);
    }
    toPlayersWithScores() {
        return this.players.map((p) => ({ name: p.name, score: p.getScore() }));
    }
    getGameName() {
        return this.name;
    }
    setName(name) {
        this.name = name;
    }
    async saveToFile(baseDir) {
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
//# sourceMappingURL=Game.js.map