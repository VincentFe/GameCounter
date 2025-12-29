import fs from "fs";
import path from "path";
import { ServerResponse } from "http";
import { getGame } from "../model/gameManager.js";

/**
 * Render the leaderboard page (leaderboard.html).
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {void}
 */
export function renderLeaderboard(res: ServerResponse, baseDir: string): void {
  const file = path.join(baseDir, "..", "src", "public", "leaderboard.html");
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end("Error loading leaderboard page");
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(data);
  });
}

/**
 * Get leaderboard data: all players sorted by score in descending order.
 * @param {ServerResponse} res - HTTP response object.
 * @returns {Promise<void>} Resolves when response is sent.
 */
export async function getLeaderboard(res: ServerResponse): Promise<void> {
  try {
    const game = getGame();

    if (!game) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify([]));
      return;
    }

    const players = game.getPlayers();
    const sorted = players
      .map((p) => ({ name: p.name, score: p.getScore() }))
      .sort((a, b) => b.score - a.score);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(sorted));
  } catch (e) {
    console.error("Error getting leaderboard:", e);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Failed to get leaderboard" }));
  }
}
