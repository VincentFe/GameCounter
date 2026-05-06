import { IncomingMessage, ServerResponse } from "http";
export interface IGame {
    getGameType(): string;
    getId(): string;
    getGameName(): string;
    setName(name: string): void;
    addPlayer(player: any): void;
    getPlayers(): any[];
    removePlayerByName(name: string): boolean;
    updatePlayerScore(name: string, score: number): void;
    setPlayerScore(name: string, score: number): void;
    getPlayerScore(name: string): number;
    reorderPlayers(newOrder: string[]): boolean;
    toPlayersWithScores(): any[];
    toPlainNames(): string[];
    saveToFile(baseDir: string): Promise<void>;
    toJSON(): any;
}
export interface IGameService {
    addPlayerByName(baseDir: string, name: string): Promise<{
        ok: boolean;
        error?: string;
    }>;
    setGameName(baseDir: string, name: string): Promise<{
        ok: boolean;
        error?: string;
    }>;
    setGameType(baseDir: string, type: string): Promise<{
        ok: boolean;
        error?: string;
    }>;
    getPlayers(): any[];
    getPlayerNames(): string[];
    deletePlayerByName(baseDir: string, name: string): Promise<{
        ok: boolean;
        error?: string;
    }>;
    updatePlayerScore(baseDir: string, name: string, score: number, historyValue?: number): Promise<{
        ok: boolean;
        error?: string;
    }>;
    setPlayerScore(baseDir: string, name: string, score: number): Promise<{
        ok: boolean;
        error?: string;
    }>;
    reorderPlayers(baseDir: string, newOrder: string[]): Promise<{
        ok: boolean;
        error?: string;
    }>;
    createGroups(baseDir: string, count: number): Promise<{
        ok: boolean;
        error?: string;
        groups?: any[];
    }>;
    startGameWithGroups(baseDir: string): Promise<{
        ok: boolean;
        error?: string;
    }>;
    getGroups(): any[];
    setGroupName(baseDir: string, groupId: string, name: string): Promise<{
        ok: boolean;
        error?: string;
    }>;
    listGames(baseDir: string): string[];
    saveGameInstance(baseDir: string): Promise<{
        ok: boolean;
    }>;
    markGameInactive(baseDir: string): Promise<{
        ok: boolean;
        error?: string;
    }>;
}
export interface IUserService {
    authenticate(baseDir: string, username: string, password: string): Promise<any | null>;
    createSession(user: any): string;
    getUserFromSession(sessionId: string): any | null;
    destroySession(sessionId: string): void;
    isGrandmaster(user: any | null): boolean;
    createUser(baseDir: string, username: string, password: string, isGrandmaster: boolean): Promise<{
        ok: boolean;
        error?: string;
    }>;
    getAllUsers(baseDir: string): Promise<any[]>;
}
export interface IController {
    (req: IncomingMessage, res: ServerResponse, baseDir: string): Promise<void> | void;
}
//# sourceMappingURL=index.d.ts.map