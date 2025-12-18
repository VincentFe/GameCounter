import { IncomingMessage, ServerResponse } from "http";
export declare function renderEnterNames(res: ServerResponse, baseDir: string): void;
export declare function saveName(req: IncomingMessage, res: ServerResponse, baseDir: string): void;
export declare function setGameName(req: IncomingMessage, res: ServerResponse, baseDir: string): void;
export declare function getPlayers(res: ServerResponse, baseDir: string): void;
export declare function getPlayerNames(res: ServerResponse, baseDir: string): void;
export declare function deletePlayer(req: IncomingMessage, res: ServerResponse, baseDir: string): void;
export declare function updatePlayerScore(req: IncomingMessage, res: ServerResponse, baseDir: string): void;
export declare function setPlayerScore(req: IncomingMessage, res: ServerResponse, baseDir: string): void;
//# sourceMappingURL=enterNames.d.ts.map