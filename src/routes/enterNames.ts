import fs from "fs";
import path from "path";
import { IncomingMessage, ServerResponse } from "http";
import { getGame, saveGame, loadGameByName } from "../gameManager.js";
import Player from "../models/Player.js";

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
    // use singleton Game instance
    (async () => {
      try {
        const game = getGame();
        game.addPlayer(new Player(name));
        await saveGame(baseDir);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
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
      const game = getGame();
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

export function getPlayers(
  res: ServerResponse,
  baseDir: string
): void {
  if (res.headersSent) return;
  try {
    const game = getGame();
    const players = game.toPlayersWithScores();
    if (res.headersSent) return;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(players));
  } catch (err) {
    if (res.headersSent) return;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify([]));
  }
}

export function getPlayerNames(
  res: ServerResponse,
  baseDir: string
): void {
  if (res.headersSent) return;
  try {
    const game = getGame();
    const players = game.toPlainNames();
    if (res.headersSent) return;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(players));
  } catch (err) {
    if (res.headersSent) return;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify([]));
  }
}

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

    (async () => {
      try {
        const game = getGame();
        const removed = game.removePlayerByName(name);
        if (!removed) {
          res.writeHead(404);
          res.end(JSON.stringify({ ok: false, error: "Name not found" }));
          return;
        }
        await saveGame(baseDir);
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
    try {
      const parsed = JSON.parse(body || "{}");
      name = (parsed.name || "").toString().trim();
      score = typeof parsed.score === "number" ? parsed.score : undefined;
    } catch (e) {
      res.writeHead(400);
      res.end(JSON.stringify({ ok: false, error: "Invalid JSON" }));
      return;
    }

    if (!name || score === undefined) {
      res.writeHead(400);
      res.end(JSON.stringify({ ok: false, error: "Name and score required" }));
      return;
    }

    (async () => {
      try {
        const game = getGame();
        game.updatePlayerScore(name, score);
        await saveGame(baseDir);
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
    try {
      const parsed = JSON.parse(body || "{}");
      name = (parsed.name || "").toString().trim();
      score = typeof parsed.score === "number" ? parsed.score : undefined;
    } catch (e) {
      res.writeHead(400);
      res.end(JSON.stringify({ ok: false, error: "Invalid JSON" }));
      return;
    }

    if (!name || score === undefined) {
      res.writeHead(400);
      res.end(JSON.stringify({ ok: false, error: "Name and score required" }));
      return;
    }

    (async () => {
      try {
        const game = getGame();
        game.setPlayerScore(name, score);
        await saveGame(baseDir);
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

export function listGames(res: ServerResponse, baseDir: string): void {
  try {
    const dbDir = path.join(baseDir, "..", "db");
    const files = fs.readdirSync(dbDir);
    const games = files
      .filter((file) => file.endsWith(".json"))
      .map((file) => file.replace(".json", ""));
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(games));
  } catch (err) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify([]));
  }
}

export function saveGameInstance(
  req: IncomingMessage,
  res: ServerResponse,
  baseDir: string
): void {
  (async () => {
    try {
      const game = getGame();
      await saveGame(baseDir);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ ok: false, error: "Failed to save game" }));
    }
  })();
}
