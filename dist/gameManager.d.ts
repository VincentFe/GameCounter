import Game from "./models/Game.js";
export declare function initializeGame(baseDir: string): Promise<Game>;
export declare function getGame(): Game;
export declare function loadGameByName(baseDir: string, gameName: string): Promise<Game>;
export declare function saveGame(baseDir: string): Promise<void>;
export declare function resetGame(): void;
declare const _default: {
    initializeGame: typeof initializeGame;
    getGame: typeof getGame;
    loadGameByName: typeof loadGameByName;
    saveGame: typeof saveGame;
    resetGame: typeof resetGame;
};
export default _default;
//# sourceMappingURL=gameManager.d.ts.map