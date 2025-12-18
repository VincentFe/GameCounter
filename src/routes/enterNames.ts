/**
 * Enter Names Route Handler
 * Manages player entry, game naming, and player management functionality.
 * Handles all API endpoints related to adding, removing, and updating players.
 */

import fs from "fs";
import path from "path";
import { IncomingMessage, ServerResponse } from "http";
import * as gameManagerPage from "../gameManager.js";
import Player from "../models/Player.js";

/**
 * Renders the enter names page where users can add players to a game.
 * @param res The HTTP response object
 * @param baseDir The base directory path for the application
 */
export function renderEnterNames(
  res: ServerResponse,
  baseDir: string
): void {
  const file = path.join(baseDir, "..", "src", "public", "enterNames.html");

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end("Error loading enter names page");
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(data);
  });
}

/**
 * Saves a new player name to the current game instance and persists to file.
 * Validates that the name is not empty and doesn't already exist.
 * @param req The HTTP request object
 * @param res The HTTP response object
 * @param baseDir The base directory path for the application
 * @returns void
 * @throws Responds with 400 if name is empty or already exists
 * @throws Responds with 500 if save operation fails
 */
export function saveName(
  req: IncomingMessage,
  res: ServerResponse,
  baseDir: string
): void {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    let name = "";
    // Parse the request body to extract player name
    try {
      const parsed = JSON.parse(body || "{}");
      name = (parsed.name || "").toString().trim();
    } catch (e) {
      res.writeHead(400);
      res.end(JSON.stringify({ ok: false, error: "Invalid JSON" }));
      return;
    }

    // Validate that name is not empty
    if (!name) {
      res.writeHead(400);
      res.end(JSON.stringify({ ok: false, error: "Name empty" }));
      return;
    }
    // use singleton Game instance
    (async () => {
      try {
        const game = gameManagerPage.getGame();
        // Check if player already exists to prevent duplicates
        const player = game.findPlayerByName(name);
        if (!player.parmSuccess) {
          res.writeHead(400);
          res.end(JSON.stringify({ ok: false, error: "Player already exists" }));
          return;
        }
        else {
          // Add the new player and persist to disk
          game.addPlayer(new Player(name));
          await gameManagerPage.saveGame(baseDir);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true }));
        }
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ ok: false, error: "Failed to save name" }));
      }
    })();
  });

  req.on("error", () => {
    res.writeHead(500);
    res.end(JSON.stringify({ ok: false, error: "Request error" }));
  });
}

/**
 * Sets the name for the current game instance without persisting to file.
 * @param req The HTTP request object containing the game name in JSON body
 * @param res The HTTP response object
 * @param baseDir The base directory path for the application
 * @returns void
 * @throws Responds with 400 if name is empty or JSON is invalid
 * @throws Responds with 500 if setName operation fails
 */
export function setGameName(
  req: IncomingMessage,
  res: ServerResponse,
  baseDir: string
): void {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    let name = "";
    // Parse incoming request body
    try {
      const parsed = JSON.parse(body || "{}");
      name = (parsed.name || "").toString().trim();
    } catch (e) {
      res.writeHead(400);
      res.end(JSON.stringify({ ok: false, error: "Invalid JSON" }));
      return;
    }

    // Validate name is not empty
    if (!name) {
      res.writeHead(400);
      res.end(JSON.stringify({ ok: false, error: "Name empty" }));
      return;
    }

    try {
      const game = gameManagerPage.getGame();
      // Update game name in memory
      game.setName(name);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ ok: false, error: "Failed to set game name" }));
    }
  });

  req.on("error", () => {
    res.writeHead(500);
    res.end(JSON.stringify({ ok: false, error: "Request error" }));
  });
}

/**
 * Retrieves all players from the current game instance with their scores.
 * @param res The HTTP response object
 * @param baseDir The base directory path for the application
 * @returns void - Sends JSON array of players with scores
 */
export function getPlayers(
  res: ServerResponse,
  baseDir: string
): void {
  if (res.headersSent) return;
  try {
    const game = gameManagerPage.getGame();
    // Get all players and convert to plain objects with scores
    const players = game.toPlayersWithScores();
    if (res.headersSent) return;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(players));
  } catch (err) {
    if (res.headersSent) return;
    // Return empty array on error for graceful degradation
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify([]));
  }
}

/**
 * Retrieves only the player names from the current game (without scores).
 * @param res The HTTP response object
 * @param baseDir The base directory path for the application
 * @returns void - Sends JSON array of player names
 */
export function getPlayerNames(
  res: ServerResponse,
  baseDir: string
): void {
  if (res.headersSent) return;
  try {
  const game = gameManagerPage.getGame();
    // Get simplified player names list
    const players = game.toPlainNames();
    if (res.headersSent) return;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(players));
  } catch (err) {
    if (res.headersSent) return;
    // Return empty array on error
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify([]));
  }
}

/**
 * Deletes a player from the current game instance and persists changes to file.
 * @param req The HTTP request object containing player name to delete
 * @param res The HTTP response object
 * @param baseDir The base directory path for the application
 * @returns void
 * @throws Responds with 400 if name is empty or JSON is invalid
 * @throws Responds with 404 if player not found
 * @throws Responds with 500 if file operation fails
 */
export function deletePlayer(
  req: IncomingMessage,
  res: ServerResponse,
  baseDir: string
): void {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    let name = "";
    // Parse and validate the player name from request
    try {
      const parsed = JSON.parse(body || "{}");
      name = (parsed.name || "").toString().trim();
    } catch (e) {
      res.writeHead(400);
      res.end(JSON.stringify({ ok: false, error: "Invalid JSON" }));
      return;
    }

    // Ensure name is provided
    if (!name) {
      res.writeHead(400);
      res.end(JSON.stringify({ ok: false, error: "Name empty" }));
      return;
    }

    (async () => {
      try {
        const game = gameManagerPage.getGame();
        // Attempt to remove the player from the game
        const removed = game.removePlayerByName(name);
        if (!removed) {
          res.writeHead(404);
          res.end(JSON.stringify({ ok: false, error: "Name not found" }));
          return;
        }
        // Persist the deletion to disk
        await gameManagerPage.saveGame(baseDir);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ ok: false, error: "Failed to update file" }));
      }
    })();
  });

  req.on("error", () => {
    res.writeHead(500);
    res.end(JSON.stringify({ ok: false, error: "Request error" }));
  });
}

/**
 * Updates a player's score by adding the provided amount to their current score.
 * Changes are persisted to file.
 * @param req The HTTP request object containing player name and score delta
 * @param res The HTTP response object
 * @param baseDir The base directory path for the application
 * @returns void
 * @throws Responds with 400 if name or score is missing/invalid
 * @throws Responds with 500 if update fails
 */
export function updatePlayerScore(
  req: IncomingMessage,
  res: ServerResponse,
  baseDir: string
): void {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    let name = "";
    let score: number | undefined;
    // Parse player name and score delta from request body
    try {
      const parsed = JSON.parse(body || "{}");
      name = (parsed.name || "").toString().trim();
      score = typeof parsed.score === "number" ? parsed.score : undefined;
    } catch (e) {
      res.writeHead(400);
      res.end(JSON.stringify({ ok: false, error: "Invalid JSON" }));
      return;
    }

    // Validate required fields are present
    if (!name || score === undefined) {
      res.writeHead(400);
      res.end(JSON.stringify({ ok: false, error: "Name and score required" }));
      return;
    }

    (async () => {
      try {
      const game = gameManagerPage.getGame();
        // Update player score and save changes
        game.updatePlayerScore(name, score);
        await gameManagerPage.saveGame(baseDir);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        res.writeHead(500);
        res.end(
          JSON.stringify({ ok: false, error: "Failed to update score" })
        );
      }
    })();
  });

  req.on("error", () => {
    res.writeHead(500);
    res.end(JSON.stringify({ ok: false, error: "Request error" }));
  });
}

/**
 * Sets a player's score to a specific value (replaces current score).
 * Changes are persisted to file.
 * @param req The HTTP request object containing player name and new score value
 * @param res The HTTP response object
 * @param baseDir The base directory path for the application
 * @returns void
 * @throws Responds with 400 if name or score is missing/invalid
 * @throws Responds with 500 if operation fails
 */
export function setPlayerScore(
  req: IncomingMessage,
  res: ServerResponse,
  baseDir: string
): void {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    let name = "";
    let score: number | undefined;
    // Parse player name and target score from request
    try {
      const parsed = JSON.parse(body || "{}");
      name = (parsed.name || "").toString().trim();
      score = typeof parsed.score === "number" ? parsed.score : undefined;
    } catch (e) {
      res.writeHead(400);
      res.end(JSON.stringify({ ok: false, error: "Invalid JSON" }));
      return;
    }

    // Validate required fields
    if (!name || score === undefined) {
      res.writeHead(400);
      res.end(JSON.stringify({ ok: false, error: "Name and score required" }));
      return;
    }

    (async () => {
      try {
        const game = gameManagerPage.getGame();
        // Set player score to exact value and persist
        game.setPlayerScore(name, score);
        await gameManagerPage.saveGame(baseDir);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        res.writeHead(500);
        res.end(
          JSON.stringify({ ok: false, error: "Failed to set score" })
        );
      }
    })();
  });

  req.on("error", () => {
    res.writeHead(500);
    res.end(JSON.stringify({ ok: false, error: "Request error" }));
  });
}

/**
 * Lists all active games available in the database.
 * Filters out games marked as inactive to show only ongoing games.
 * @param res The HTTP response object
 * @param baseDir The base directory path for the application
 * @returns void - Sends JSON array of game names
 */
export function listGames(res: ServerResponse, baseDir: string): void {
  try {
    const dbDir = path.join(baseDir, "..", "db");
    const files = fs.readdirSync(dbDir);
    const games: string[] = [];

    // Filter for active games, excluding completed ones
    files.forEach((file) => {
      if (file.endsWith(".json")) {
        try {
          const filePath = path.join(dbDir, file);
          const data = fs.readFileSync(filePath, "utf8");
          const gameData = JSON.parse(data);
          // Include game if active is true or not specified (backward compatibility)
          if (gameData.active !== false) {
            games.push(file.replace(".json", ""));
          }
        } catch (e) {
          // Skip files that can't be parsed
        }
      }
    });

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(games));
  } catch (err) {
    // Return empty array on directory read error
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify([]));
  }
}

/**
 * Persists the current game instance to disk.
 * @param req The HTTP request object
 * @param res The HTTP response object
 * @param baseDir The base directory path for the application
 * @returns void
 * @throws Responds with 500 if save operation fails
 */
export function saveGameInstance(
  req: IncomingMessage,
  res: ServerResponse,
  baseDir: string
): void {
  (async () => {
    try {
      const game = gameManagerPage.getGame();
      // Persist current game state to database file
      await gameManagerPage.saveGame(baseDir);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ ok: false, error: "Failed to save game" }));
    }
  })();
}

export function addPlayer(
  req: IncomingMessage,
  res: ServerResponse,
  baseDir: string
): void {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    let name = "";
    try {
      const parsed = JSON.parse(body || "{}");
      name = (parsed.name || "").toString().trim();
    } catch (e) {
      res.writeHead(400);
      res.end(JSON.stringify({ ok: false, error: "Invalid JSON" }));
      return;
    }

    if (!name) {
      res.writeHead(400);
      res.end(JSON.stringify({ ok: false, error: "Name empty" }));
      return;
    }

    try {
      const game = gameManagerPage.getGame();
      // Check if player already exists
      const playerResult = game.findPlayerByName(name);
      if (playerResult.parmSuccess()) {
        res.writeHead(400);
        res.end(JSON.stringify({ ok: false, error: "Player already exists" }));
        return;
      }
      game.addPlayer(new Player(name));
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ ok: false, error: "Failed to add player" }));
    }
  });

  req.on("error", () => {
    res.writeHead(500);
    res.end(JSON.stringify({ ok: false, error: "Request error" }));
  });
}

export function markGameInactive(
  req: IncomingMessage,
  res: ServerResponse,
  baseDir: string
): void {
  (async () => {
    try {
      const game = gameManagerPage.getGame();
      game.setActive(false);
      await gameManagerPage.saveGame(baseDir);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ ok: false, error: "Failed to mark game inactive" }));
    }
  })();
}

export function getGameName(res: ServerResponse): void {
  try {
    const game = gameManagerPage.getGame();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ name: game.getGameName() }));
  } catch (err) {
    res.writeHead(500);
    res.end(JSON.stringify({ ok: false, error: "Failed to get game name" }));
  }
}
