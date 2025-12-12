export declare class Player {
    name: string;
    score: number;
    constructor(name: string, score?: number);
    addScore(points: number): void;
    setScore(score: number): void;
    getScore(): number;
    toJSON(): {
        name: string;
        score: number;
    };
    static fromJSON(obj: any): Player;
    toString(): string;
}
export default Player;
//# sourceMappingURL=Player.d.ts.map