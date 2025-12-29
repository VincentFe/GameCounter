import fs from "fs";
import path from "path";
import { ServerResponse } from "http";
import { getGame } from "../model/gameManager.js";

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
