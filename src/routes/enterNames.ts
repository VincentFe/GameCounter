import fs from "fs";
import path from "path";
import { IncomingMessage, ServerResponse } from "http";
import { getGame, saveGame, loadGameByName } from "../gameManager.js";
import Player from "../models/Player.js";

export function renderEnterNames(
  res: ServerResponse,
  baseDir: string,
  initialPlayers?: Array<{ name: string; score?: number }>
): void {
  const file = path.join(baseDir, "..", "src", "public", "enterNames.html");

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end("Error loading enter names page");
      return;
    }
    let html = data.toString();
    
    // Inject initial players data as JSON in the HTML
    if (initialPlayers && initialPlayers.length > 0) {
      const playersJson = JSON.stringify(initialPlayers);
      const script = `<script>window.__initialPlayers = ${playersJson};</script>`;
      html = html.replace("</head>", `${script}</head>`);
    }
    
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
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
        // Check if player already exists
        if (game.findPlayerIndexByName(name) !== -1) {
          res.writeHead(400);
          res.end(JSON.stringify({ ok: false, error: "Player already exists" }));
          return;
        }
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

export function setGameType(
  req: IncomingMessage,
  res: ServerResponse,
  baseDir: string
): void {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    let type = "";
    try {
      const parsed = JSON.parse(body || "{}");
      type = (parsed.type || "").toString().trim();
    } catch (e) {
      res.writeHead(400);
      res.end(JSON.stringify({ ok: false, error: "Invalid JSON" }));
      return;
    }

    if (!type || (type !== "quiz" && type !== "chinees poepeke")) {
      res.writeHead(400);
      res.end(JSON.stringify({ ok: false, error: "Invalid game type" }));
      return;
    }

    try {
      const game = getGame();
      game.setGameType(type as any);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ ok: false, error: "Failed to set game type" }));
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

export function removeAllPlayers(
  req: IncomingMessage,
  res: ServerResponse,
  baseDir: string
): void {
  (async () => {
    try {
      const game = getGame();
      game.removeAllPlayers();
      await saveGame(baseDir);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ ok: false, error: "Failed to remove all players" }));
    }
  })();
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
    let parsed: any = {};
    try {
      parsed = JSON.parse(body || "{}");
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
        // Optionally append a history value if provided
        if (typeof (parsed as any).historyValue === "number") {
          game.addPlayerHistory(name, (parsed as any).historyValue);
        }
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
    const games: string[] = [];

    // Filter for active games
    files.forEach((file) => {
      if (file.endsWith(".json")) {
        try {
          const filePath = path.join(dbDir, file);
          const data = fs.readFileSync(filePath, "utf8");
          const gameData = JSON.parse(data);
          if (gameData.active !== false) {
            // Include game if active is true or not specified (backward compatibility)
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
      const game = getGame();
      // Check if player already exists
      if (game.findPlayerIndexByName(name) !== -1) {
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
      const game = getGame();
      game.setActive(false);
      await saveGame(baseDir);
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
    const game = getGame();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ name: game.getGameName() }));
  } catch (err) {
    res.writeHead(500);
    res.end(JSON.stringify({ ok: false, error: "Failed to get game name" }));
  }
}

export function getGameType(res: ServerResponse): void {
  try {
    const game = getGame();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ type: game.getGameType() }));
  } catch (err) {
    res.writeHead(500);
    res.end(JSON.stringify({ ok: false, error: "Failed to get game type" }));
  }
}
