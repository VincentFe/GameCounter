import { ServerResponse } from "http";
/**
 * Render the leaderboard page (leaderboard.html).
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {void}
 */
export declare function renderLeaderboard(res: ServerResponse, baseDir: string): void;
/**
 * Get leaderboard data: all players sorted by score in descending order.
 * @param {ServerResponse} res - HTTP response object.
 * @returns {Promise<void>} Resolves when response is sent.
 */
export declare function getLeaderboard(res: ServerResponse): Promise<void>;
//# sourceMappingURL=leaderboard.d.ts.map