export declare class Player {
    name: string;
    score: number;
    history: number[];
    constructor(name: string, score?: number, history?: number[]);
    addScore(points: number): void;
    setScore(score: number): void;
    getScore(): number;
    toJSON(): {
        name: string;
        score: number;
        history?: number[];
    };
    static fromJSON(obj: any): Player;
    addHistory(value: number): void;
    getHistory(): number[];
    toString(): string;
}
export default Player;
//# sourceMappingURL=Player.d.ts.map