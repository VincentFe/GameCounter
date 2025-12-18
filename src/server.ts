import http from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { IncomingMessage, ServerResponse } from "http";

import homeRoute from "./routes/home.js";
import {
  renderEnterNames,
  saveName,
  setGameName,
  getPlayers,
  deletePlayer,
  updatePlayerScore,
  setPlayerScore,
  getPlayerNames,
  listGames,
  saveGameInstance,
  addPlayer,
  markGameInactive,
} from "./routes/enterNames.js";
import { serveStatic } from "./routes/static.js";
import { renderGamePage } from "./routes/game.js";
import { renderLeaderboard, getLeaderboard } from "./routes/leaderboard.js";
import { initializeGame, saveGame, loadGameByName } from "./gameManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = 3000;

const server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    const { method, url } = req;

    // Parse URL to separate path from query string
    const urlParts = url?.split("?") || [];
    const pathname = urlParts[0];
    const queryString = urlParts[1] || "";

    // Helper to get query param
    function getQueryParam(key: string): string | null {
      const params = new URLSearchParams(queryString);
      return params.get(key);
    }

    //
    // ────────────────────────────────────────────────────────────────
    // 1. API ROUTES (must be FIRST)
    // ────────────────────────────────────────────────────────────────
    //
    if (method === "GET" && url === "/players") {
      return getPlayers(res, __dirname);
    }

    if (method === "POST" && url === "/saveName") {
      return saveName(req, res, __dirname);
    }

    if (method === "POST" && url === "/setGameName") {
      return setGameName(req, res, __dirname);
    }

    if ((method === "POST" || method === "DELETE") && url === "/deletePlayer") {
      return deletePlayer(req, res, __dirname);
    }

    if (method === "POST" && url === "/updateScore") {
      return updatePlayerScore(req, res, __dirname);
    }

    if (method === "POST" && url === "/setScore") {
      return setPlayerScore(req, res, __dirname);
    }

    if (method === "GET" && url === "/api/leaderboard") {
      return getLeaderboard(res);
    }

    if (method === "GET" && url === "/playerNames") {
      return getPlayerNames(res, __dirname);
    }

    if (method === "GET" && url === "/listGames") {
      return listGames(res, __dirname);
    }

    if (method === "POST" && url === "/saveGame") {
      return saveGameInstance(req, res, __dirname);
    }

    if (method === "POST" && url === "/addPlayer") {
      return addPlayer(req, res, __dirname);
    }

    if (method === "POST" && url === "/markGameInactive") {
      return markGameInactive(req, res, __dirname);
    }

    //
    // ────────────────────────────────────────────────────────────────
    // 2. PAGE ROUTES
    // ────────────────────────────────────────────────────────────────
    //
    if (method === "GET" && (url === "/" || url === "/index.html")) {
      return homeRoute(res, __dirname);
    }

    if (method === "GET" && url === "/enterNames") {
      return renderEnterNames(res, __dirname);
    }

    if (method === "GET" && pathname === "/game") {
      const gameName = getQueryParam("game");
      if (gameName) {
        // Load the specified game before rendering
        loadGameByName(__dirname, gameName)
          .then(() => renderGamePage(res, __dirname))
          .catch((err) => {
            console.error("Failed to load game:", err);
            res.writeHead(500);
            res.end("Failed to load game");
          });
        return; // Prevent falling through to other handlers
      } else {
        // No game specified, just render with current game instance
        return renderGamePage(res, __dirname);
      }
    }

    if (method === "GET" && url === "/leaderboard") {
      return renderLeaderboard(res, __dirname);
    }

    if (method === "POST" && url === "/endGame") {
      return saveGame(__dirname).then(() => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      });
    }

    //
    // ────────────────────────────────────────────────────────────────
    // 3. STATIC FILES (CSS, JS, images, etc.)
    // ────────────────────────────────────────────────────────────────
    //
    if (method === "GET" && url?.startsWith("/public/")) {
      return serveStatic(req, res, __dirname);
    }

    //
    // ────────────────────────────────────────────────────────────────
    // 4. 404 Not Found
    // ────────────────────────────────────────────────────────────────
    //
    res.writeHead(404);
    res.end("Not Found");
  }
);

// Initialize game instance on server startup
(async () => {
  try {
    await initializeGame(__dirname);
    console.log("✅ Game instance initialized");
  } catch (err) {
    console.error("Failed to initialize game:", err);
  }

  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
})();
