/**
 * HTTP Server for GameCounter application.
 * 
 * Entry point for the application that sets up an HTTP server on port 3000.
 * Implements routing for API endpoints, page routes, and static file serving.
 * 
 * Request handling flow:
 * 1. API routes (GET/POST) — handled by controller functions
 * 2. Page routes (GET) — renders HTML pages
 * 3. Static files (GET) — serves CSS, JS, images from public directory
 * 4. 404 handling — returns "Not Found" for unmatched routes
 * 
 * Game initialization:
 * - Calls initializeGame(__dirname) on startup to create singleton game instance
 * - Supports loading existing games via /game?game=<name> query parameter
 */

import http from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { IncomingMessage, ServerResponse } from "http";

import homeRoute from "./controllers/home.js";
import {
  renderEnterNames,
  saveName,
  setGameName,
  setGameType,
  getPlayers,
  deletePlayer,
  updatePlayerScore,
  setPlayerScore,
  getPlayerNames,
  listGames,
  saveGameInstance,
  addPlayer,
  markGameInactive,
  getGameName,
  getGameType,
  getRound,
  setRound,
  removeAllPlayers,
} from "./controllers/enterNames.js";
import { serveStatic } from "./controllers/static.js";
import { renderGamePage } from "./controllers/game.js";
import { renderLeaderboard, getLeaderboard } from "./controllers/leaderboard.js";
import { initializeGame, saveGame, loadGameByName, getGame } from "./model/gameManager.js";

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

    // Helper to extract query parameter value
    function getQueryParam(key: string): string | null {
      const params = new URLSearchParams(queryString);
      return params.get(key);
    }

    //
    // ────────────────────────────────────────────────────────────────
    // 1. API ROUTES (must be FIRST to prevent conflicts with page routes)
    // ────────────────────────────────────────────────────────────────
    //

    // Get all players with scores
    if (method === "GET" && url === "/players") {
      return getPlayers(res, __dirname);
    }

    // Add a player to the current game
    if (method === "POST" && url === "/saveName") {
      return saveName(req, res, __dirname);
    }

    // Set the game's name
    if (method === "POST" && url === "/setGameName") {
      return setGameName(req, res, __dirname);
    }

    // Set the game's type (quiz or chinees poepeke)
    if (method === "POST" && url === "/setGameType") {
      return setGameType(req, res, __dirname);
    }

    // Delete a player from the current game
    if ((method === "POST" || method === "DELETE") && url === "/deletePlayer") {
      return deletePlayer(req, res, __dirname);
    }

    // Remove all players from the current game
    if (method === "POST" && url === "/removeAllPlayers") {
      return removeAllPlayers(req, res, __dirname);
    }

    // Update a player's score (add delta)
    if (method === "POST" && url === "/updateScore") {
      return updatePlayerScore(req, res, __dirname);
    }

    // Set a player's score to absolute value
    if (method === "POST" && url === "/setScore") {
      return setPlayerScore(req, res, __dirname);
    }

    // Get leaderboard (players sorted by score)
    if (method === "GET" && url === "/api/leaderboard") {
      return getLeaderboard(res);
    }

    // Get all player names
    if (method === "GET" && url === "/playerNames") {
      return getPlayerNames(res, __dirname);
    }

    // List all active games from db folder
    if (method === "GET" && url === "/listGames") {
      return listGames(res, __dirname);
    }

    // Get the current game's name
    if (method === "GET" && url === "/getGameName") {
      return getGameName(res);
    }

    // Get the current game's type
    if (method === "GET" && url === "/getGameType") {
      return getGameType(res);
    }

    // Get the current round number
    if (method === "GET" && url === "/getRound") {
      return getRound(res);
    }

    // Set the round number
    if (method === "POST" && url === "/setRound") {
      return setRound(req, res, __dirname);
    }

    // Save the current game instance to file
    if (method === "POST" && url === "/saveGame") {
      return saveGameInstance(req, res, __dirname);
    }

    // Add a player (alias for /saveName)
    if (method === "POST" && url === "/addPlayer") {
      return addPlayer(req, res, __dirname);
    }

    // Mark the current game as inactive
    if (method === "POST" && url === "/markGameInactive") {
      return markGameInactive(req, res, __dirname);
    }

    //
    // ────────────────────────────────────────────────────────────────
    // 2. PAGE ROUTES (HTML pages)
    // ────────────────────────────────────────────────────────────────
    //

    // Home page
    if (method === "GET" && (url === "/" || url === "/index.html")) {
      return homeRoute(res, __dirname);
    }

    // Enter names page
    if (method === "GET" && url === "/enterNames") {
      return renderEnterNames(res, __dirname);
    }

    // Game page (supports loading existing game via ?game=<name> query param)
    if (method === "GET" && pathname === "/game") {
      const gameName = getQueryParam("game");
      if (gameName) {
        // Load the specified game before rendering
        loadGameByName(__dirname, gameName)
          .then(() => {
            const game = getGame();
            const gameType = game.getGameType();
            renderGamePage(res, __dirname, gameType);
          })
          .catch((err) => {
            console.error("Failed to load game:", err);
            res.writeHead(500);
            res.end("Failed to load game");
          });
        return; // Prevent falling through to other handlers
      } else {
        // No game specified, just render with current game instance
        try {
          const game = getGame();
          const gameType = game.getGameType();
          return renderGamePage(res, __dirname, gameType);
        } catch (err) {
          console.error("Error getting game type:", err);
          return renderGamePage(res, __dirname, "quiz");
        }
      }
    }

    // Leaderboard page
    if (method === "GET" && url === "/leaderboard") {
      return renderLeaderboard(res, __dirname);
    }

    // End game and save to file
    if (method === "POST" && url === "/endGame") {
      return saveGame(__dirname).then(() => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      });
    }

    //
    // ────────────────────────────────────────────────────────────────
    // 3. STATIC FILES (CSS, JS, images, fonts, etc.)
    // ────────────────────────────────────────────────────────────────
    //
    if (method === "GET" && url?.startsWith("/public/")) {
      return serveStatic(req, res, __dirname);
    }

    //
    // ────────────────────────────────────────────────────────────────
    // 4. 404 Not Found (fallback for unmatched routes)
    // ────────────────────────────────────────────────────────────────
    //
    res.writeHead(404);
    res.end("Not Found");
  }
);

// Initialize game instance and start server
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
