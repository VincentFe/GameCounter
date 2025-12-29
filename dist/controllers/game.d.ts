import { ServerResponse } from "http";
/**
 * Render the appropriate game page based on game type.
 * Serves either gameQuiz.html (default) or gameChineesPoepeke.html.
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @param {string} [gameType="quiz"] - The game type to determine which HTML file to serve.
 * @returns {Promise<void>} Resolves when response is sent.
 */
export declare function renderGamePage(res: ServerResponse, baseDir: string, gameType?: string): Promise<void>;
//# sourceMappingURL=game.d.ts.map