import http from "http";
import path from "path";
import fs from "fs";
import { IncomingMessage, ServerResponse } from "http";

import homeRoute from "./controllers/home.js";
import {
  renderEnterNames,
  saveName,
  setGameName,
  setGameType,
  startGameWithGroups,
  createGroups,
  getGroups,
  setGroupName,
  getPlayers,
  deletePlayer,
  updatePlayerScore,
  setPlayerScore,
  reorderPlayers,
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
  resetPlayersForNewGame,
} from "./controllers/enterNames.js";
import { serveStatic } from "./controllers/static.js";
import { renderGamePage } from "./controllers/game.js";
import { renderLeaderboard, getLeaderboard } from "./controllers/leaderboard.js";
import { initializeGame, saveGame, loadGameByName, getGame } from "./model/gameManager.js";
import * as UserService from "./model/UserService.js";
import { getSessionId, getCurrentUser, requireAuth, requireGrandmaster } from "./middleware/auth.js";

const appDir = path.join(process.cwd(), "src");

/**
 * Render the login page.
 * @param {ServerResponse} res - The response object.
 */
function renderLoginPage(res: ServerResponse): void {
  const file = path.join(appDir, "public", "login.html");
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end("Error loading login page");
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(data);
  });
}

/**
 * Handle login requests.
 * @param {IncomingMessage} req - The request object.
 * @param {ServerResponse} res - The response object.
 */
async function handleLogin(req: IncomingMessage, res: ServerResponse): Promise<void> {
  let body = "";
  req.on("data", (chunk) => (body += chunk.toString()));
  req.on("end", async () => {
    const params = new URLSearchParams(body);
    const username = params.get("username");
    const password = params.get("password");

    if (!username || !password) {
      res.writeHead(400);
      res.end("Username and password required");
      return;
    }

    const user = await UserService.authenticate(appDir, username, password);
    if (user) {
      const sessionId = UserService.createSession(user);
      res.writeHead(302, {
        Location: "/",
        "Set-Cookie": `sessionId=${sessionId}; HttpOnly; Path=/; Max-Age=86400`,
      });
      res.end();
    } else {
      res.writeHead(401);
      res.end("Invalid username or password");
    }
  });
}

/**
 * Handle logout requests.
 * @param {IncomingMessage} req - The request object.
 * @param {ServerResponse} res - The response object.
 */
function handleLogout(req: IncomingMessage, res: ServerResponse): void {
  const sessionId = getSessionId(req);
  if (sessionId) {
    UserService.destroySession(sessionId);
  }
  res.writeHead(302, {
    Location: "/login",
    "Set-Cookie": "sessionId=; HttpOnly; Path=/; Max-Age=0",
  });
  res.end();
}

/**
 * Handle create user POST request.
 * @param {IncomingMessage} req - The request object.
 * @param {ServerResponse} res - The response object.
 */
async function handleCreateUser(req: IncomingMessage, res: ServerResponse): Promise<void> {
  let body = "";
  req.on("data", (chunk) => (body += chunk.toString()));
  req.on("end", async () => {
    const params = new URLSearchParams(body);
    const username = params.get("username");
    const password = params.get("password");
    const role = params.get("role");

    if (!username || !password) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Username and password required" }));
      return;
    }

    const isGrandmaster = role === "grandmaster";
    const result = await UserService.createUser(appDir, username, password, isGrandmaster);

    if (result.ok) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "User created successfully" }));
    } else {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: result.error }));
    }
  });
}

/**
 * Handle get user role GET request.
 * @param {IncomingMessage} req - The request object.
 * @param {ServerResponse} res - The response object.
 */
function handleGetUserRole(req: IncomingMessage, res: ServerResponse): void {
  const sessionId = getSessionId(req);
  if (!sessionId) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ isGrandmaster: false }));
    return;
  }

  const user = UserService.getUserFromSession(sessionId);
  if (!user) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ isGrandmaster: false }));
    return;
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ isGrandmaster: UserService.isGrandmaster(user) }));
}

/**
 * Handle get all users for admin.
 * @param {IncomingMessage} req - The request object.
 * @param {ServerResponse} res - The response object.
 */
async function handleGetUsers(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const users = await UserService.getAllUsers(appDir);
  const safeUsers = users.map((user) => ({
    guid: user.guid,
    username: user.username,
    role: user.isGrandmaster() ? "grandmaster" : "user",
  }));
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(safeUsers));
}

/**
 * Create the app request listener with all route handlers.
 * @returns {http.RequestListener}
 */
function createRequestListener(): http.RequestListener {
  return async (req, res) => {
    const method = req.method;
    const url = req.url;

    if (!method || !url) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Missing URL or method" }));
      return;
    }

    const urlParts = url.split("?");
    const pathname = urlParts[0];
    const queryString = urlParts[1] || "";

    function getQueryParam(key: string): string | null {
      const params = new URLSearchParams(queryString);
      return params.get(key);
    }

    // Handle auth routes
    if (handleAuthRoutes(req, res, method, pathname)) return;

    // Require auth for all other routes
    if (!requireAuth(req, res)) return;

    // Handle game routes
    if (handleGameRoutes(req, res, method, url, pathname, getQueryParam, appDir)) return;

    // Handle static files
    if (method === "GET" && url?.startsWith("/public/")) {
      return serveStatic(req, res, appDir);
    }

    res.writeHead(404);
    res.end("Not Found");
  };
}

/**
 * Handle authentication-related routes.
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * @param {string} method
 * @param {string} pathname
 * @returns {boolean} True if handled
 */
function handleAuthRoutes(req: IncomingMessage, res: ServerResponse, method: string, pathname: string): boolean {
  if (method === "GET" && pathname === "/login") {
    renderLoginPage(res);
    return true;
  }
  if (method === "POST" && pathname === "/login") {
    handleLogin(req, res);
    return true;
  }
  if (method === "POST" && pathname === "/logout") {
    handleLogout(req, res);
    return true;
  }
  return false;
}

/**
 * Handle game-related routes.
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * @param {string} method
 * @param {string} url
 * @param {string} pathname
 * @param {Function} getQueryParam
 * @param {string} appDir
 * @returns {boolean} True if handled
 */
function handleGameRoutes(
  req: IncomingMessage,
  res: ServerResponse,
  method: string,
  url: string,
  pathname: string,
  getQueryParam: (key: string) => string | null,
  appDir: string
): boolean {
  if (method === "GET" && url === "/players") {
    if (!requireGrandmaster(req, res)) return true;
    getPlayers(res, appDir);
    return true;
  }
  if (method === "POST" && url === "/saveName") {
    if (!requireGrandmaster(req, res)) return true;
    saveName(req, res, appDir);
    return true;
  }
  if (method === "POST" && url === "/setGameName") {
    if (!requireGrandmaster(req, res)) return true;
    setGameName(req, res, appDir);
    return true;
  }
  if (method === "POST" && url === "/setGameType") {
    if (!requireGrandmaster(req, res)) return true;
    setGameType(req, res, appDir);
    return true;
  }
  if ((method === "POST" || method === "DELETE") && url === "/deletePlayer") {
    if (!requireGrandmaster(req, res)) return true;
    deletePlayer(req, res, appDir);
    return true;
  }
  if (method === "POST" && url === "/removeAllPlayers") {
    if (!requireGrandmaster(req, res)) return true;
    removeAllPlayers(req, res, appDir);
    return true;
  }
  if (method === "POST" && url === "/resetPlayersForNewGame") {
    if (!requireGrandmaster(req, res)) return true;
    resetPlayersForNewGame(req, res, appDir);
    return true;
  }
  if (method === "POST" && url === "/updateScore") {
    if (!requireGrandmaster(req, res)) return true;
    updatePlayerScore(req, res, appDir);
    return true;
  }
  if (method === "POST" && url === "/setScore") {
    if (!requireGrandmaster(req, res)) return true;
    setPlayerScore(req, res, appDir);
    return true;
  }
  if (method === "POST" && url === "/reorderPlayers") {
    if (!requireGrandmaster(req, res)) return true;
    reorderPlayers(req, res, appDir);
    return true;
  }
  if (method === "POST" && url === "/createUser") {
    if (!requireGrandmaster(req, res)) return true;
    handleCreateUser(req, res);
    return true;
  }
  if (method === "GET" && url === "/api/users") {
    if (!requireAuth(req, res)) return true;
    handleGetUsers(req, res);
    return true;
  }
  if (method === "GET" && url === "/api/user-role") {
    handleGetUserRole(req, res);
    return true;
  }
  if (method === "GET" && url === "/api/leaderboard") {
    getLeaderboard(res);
    return true;
  }
  if (method === "GET" && url === "/playerNames") {
    getPlayerNames(res, appDir);
    return true;
  }
  if (method === "GET" && url === "/groups") {
    getGroups(res);
    return true;
  }
  if (method === "GET" && url === "/listGames") {
    listGames(res, appDir);
    return true;
  }
  if (method === "GET" && url === "/getGameName") {
    getGameName(res);
    return true;
  }
  if (method === "GET" && url === "/getGameType") {
    getGameType(res);
    return true;
  }
  if (method === "GET" && url === "/getRound") {
    getRound(res);
    return true;
  }
  if (method === "POST" && url === "/setRound") {
    if (!requireGrandmaster(req, res)) return true;
    setRound(req, res, appDir);
    return true;
  }
  if (method === "POST" && url === "/saveGame") {
    if (!requireGrandmaster(req, res)) return true;
    saveGameInstance(req, res, appDir);
    return true;
  }
  if (method === "POST" && url === "/createGroups") {
    if (!requireGrandmaster(req, res)) return true;
    createGroups(req, res, appDir);
    return true;
  }
  if (method === "POST" && url === "/setGroupName") {
    if (!requireGrandmaster(req, res)) return true;
    setGroupName(req, res, appDir);
    return true;
  }
  if (method === "POST" && url === "/startGameWithGroups") {
    if (!requireGrandmaster(req, res)) return true;
    startGameWithGroups(req, res, appDir);
    return true;
  }
  if (method === "POST" && url === "/addPlayer") {
    if (!requireGrandmaster(req, res)) return true;
    addPlayer(req, res, appDir);
    return true;
  }
  if (method === "POST" && url === "/markGameInactive") {
    if (!requireGrandmaster(req, res)) return true;
    markGameInactive(req, res, appDir);
    return true;
  }
  if (method === "GET" && (url === "/" || url === "/index.html")) {
    if (!requireGrandmaster(req, res)) return true;
    homeRoute(res, appDir);
    return true;
  }
  if (method === "GET" && pathname === "/enterNames") {
    if (!requireGrandmaster(req, res)) return true;
    renderEnterNames(res, appDir);
    return true;
  }
  if (method === "GET" && pathname === "/game") {
    if (!requireGrandmaster(req, res)) return true;
    const gameName = getQueryParam("game");
    if (gameName) {
      loadGameByName(appDir, gameName)
        .then(() => {
          const game = getGame();
          const gameType = game.getGameType();
          renderGamePage(res, appDir, gameType);
        })
        .catch((err) => {
          console.error("Failed to load game:", err);
          res.writeHead(500);
          res.end("Failed to load game");
        });
      return true;
    } else {
      try {
        const game = getGame();
        const gameType = game.getGameType();
        renderGamePage(res, appDir, gameType);
        return true;
      } catch (err) {
        console.error("Error getting game type:", err);
        renderGamePage(res, appDir, "quiz");
        return true;
      }
    }
  }
  if (method === "GET" && url === "/leaderboard") {
    renderLeaderboard(res, appDir);
    return true;
  }
  if (method === "POST" && url === "/endGame") {
    saveGame(appDir).then(() => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    });
    return true;
  }
  return false;
}

/**
 * Create and initialize the HTTP server.
 * @returns {Promise<http.Server>} The initialized HTTP server.
 */
export async function createServer(): Promise<http.Server> {
  await initializeGame(appDir);
  return http.createServer(createRequestListener());
}
