import Player from "./Player.js";
export declare class Game {
    private players;
    private name;
    private active;
    constructor(players?: Player[], name?: string, active?: boolean);
    addPlayer(player: Player | string): void;
    updatePlayerScore(name: string, score: number): void;
    setPlayerScore(name: string, score: number): void;
    getPlayerScore(name: string): number;
    getPlayers(): Player[];
    findPlayerIndexByName(name: string): number;
    removePlayerByName(name: string): boolean;
    removeAllPlayers(): void;
    toJSON(): {
        name: string;
        players: any[];
        active: boolean;
    };
    static fromJSON(obj: any): Game;
    toPlainNames(): string[];
    toPlayersWithScores(): any[];
    getGameName(): string;
    setName(name: string): void;
    setActive(active: boolean): void;
    isActive(): boolean;
    saveToFile(baseDir: string): Promise<void>;
}
export default Game;
//# sourceMappingURL=Game.d.ts.map