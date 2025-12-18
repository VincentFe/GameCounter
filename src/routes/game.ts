/**
 * Game Route Handler
 * Renders the game page where players can manage scores during gameplay.
 */

import fs from "fs";
import path from "path";
import { ServerResponse } from "http";

/**
 * Serves the game page (game.html).
 * This page is displayed during active gameplay and allows score updates.
 * @param res The HTTP response object
 * @param baseDir The base directory path for the application
 */
export function renderGamePage(
  res: ServerResponse,
  baseDir: string
): void {
  const file = path.join(baseDir, "..", "src", "public", "game.html");

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end("Error loading game page");
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(data);
  });
}
