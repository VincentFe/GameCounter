import Player from "./Player.js";
export declare class Game {
    private players;
    constructor(players?: Player[]);
    addPlayer(player: Player | string): void;
    updatePlayerScore(name: string, score: number): void;
    setPlayerScore(name: string, score: number): void;
    getPlayerScore(name: string): number;
    getPlayers(): Player[];
    findPlayerIndexByName(name: string): number;
    removePlayerByName(name: string): boolean;
    toJSON(): {
        players: any[];
    };
    static fromJSON(obj: any): Game;
    toPlainNames(): string[];
    toPlayersWithScores(): any[];
    static loadFromFile(baseDir: string): Promise<Game>;
    saveToFile(baseDir: string): Promise<void>;
}
export default Game;
//# sourceMappingURL=Game.d.ts.map