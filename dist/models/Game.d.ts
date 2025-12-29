import Player from "./Player.js";
export declare enum GameType {
    QUIZ = "quiz",
    CHINEES_POEPEKE = "chinees poepeke"
}
export declare class Game {
    private players;
    private name;
    private active;
    private gameType;
    private round;
    constructor(players?: Player[], name?: string, active?: boolean, gameType?: GameType, round?: number);
    addPlayer(player: Player | string): void;
    updatePlayerScore(name: string, score: number): void;
    setPlayerScore(name: string, score: number): void;
    getPlayerScore(name: string): number;
    getPlayers(): Player[];
    findPlayerIndexByName(name: string): number;
    removePlayerByName(name: string): boolean;
    removeAllPlayers(): void;
    getGameType(): GameType;
    setGameType(type: GameType): void;
    getRound(): number;
    setRound(round: number): void;
    toJSON(): {
        name: string;
        players: any[];
        active: boolean;
        gameType: GameType;
        round: number;
    };
    static fromJSON(obj: any): Game;
    toPlainNames(): string[];
    toPlayersWithScores(): any[];
    addPlayerHistory(name: string, value: number): void;
    getGameName(): string;
    setName(name: string): void;
    setActive(active: boolean): void;
    isActive(): boolean;
    saveToFile(baseDir: string): Promise<void>;
}
export default Game;
//# sourceMappingURL=Game.d.ts.map