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

const appDir = path.join(process.cwd(), "src");

/**
 * Get session ID from cookies.
 * @param {IncomingMessage} req - The incoming request.
 * @returns {string|null} Session ID or null.
 */
function getSessionId(req: IncomingMessage): string | null {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const sessionCookie = cookies.find((c) => c.startsWith("sessionId="));
  return sessionCookie ? sessionCookie.split("=")[1] : null;
}

/**
 * Get current user from the request session.
 * @param {IncomingMessage} req - The incoming request.
 * @returns {import("./model/User.js").User|null} The current user or null.
 */
function getCurrentUser(req: IncomingMessage) {
  const sessionId = getSessionId(req);
  return sessionId ? UserService.getUserFromSession(sessionId) : null;
}

/**
 * Ensure the request is authenticated.
 * @param {IncomingMessage} req - The incoming request.
 * @param {ServerResponse} res - The response object.
 * @returns {boolean} True when authenticated.
 */
function requireAuth(req: IncomingMessage, res: ServerResponse): boolean {
  const user = getCurrentUser(req);
  if (!user) {
    res.writeHead(302, { Location: "/login" });
    res.end();
    return false;
  }
  return true;
}

/**
 * Ensure the request is made by a grandmaster user.
 * @param {IncomingMessage} req - The incoming request.
 * @param {ServerResponse} res - The response object.
 * @returns {boolean} True when grandmaster.
 */
function requireGrandmaster(req: IncomingMessage, res: ServerResponse): boolean {
  const user = getCurrentUser(req);
  if (!UserService.isGrandmaster(user)) {
    res.writeHead(403);
    res.end("Forbidden: Grandmaster access required");
    return false;
  }
  return true;
}

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
    const { method, url } = req;
    const urlParts = url?.split("?") || [];
    const pathname = urlParts[0];
    const queryString = urlParts[1] || "";

    function getQueryParam(key: string): string | null {
      const params = new URLSearchParams(queryString);
      return params.get(key);
    }

    if (method === "GET" && pathname === "/login") {
      return renderLoginPage(res);
    }
    if (method === "POST" && pathname === "/login") {
      return handleLogin(req, res);
    }
    if (method === "POST" && pathname === "/logout") {
      return handleLogout(req, res);
    }

    if (!requireAuth(req, res)) return;

    if (method === "GET" && url === "/players") {
      if (!requireGrandmaster(req, res)) return;
      return getPlayers(res, appDir);
    }
    if (method === "POST" && url === "/saveName") {
      if (!requireGrandmaster(req, res)) return;
      return saveName(req, res, appDir);
    }
    if (method === "POST" && url === "/setGameName") {
      if (!requireGrandmaster(req, res)) return;
      return setGameName(req, res, appDir);
    }
    if (method === "POST" && url === "/setGameType") {
      if (!requireGrandmaster(req, res)) return;
      return setGameType(req, res, appDir);
    }
    if ((method === "POST" || method === "DELETE") && url === "/deletePlayer") {
      if (!requireGrandmaster(req, res)) return;
      return deletePlayer(req, res, appDir);
    }
    if (method === "POST" && url === "/removeAllPlayers") {
      if (!requireGrandmaster(req, res)) return;
      return removeAllPlayers(req, res, appDir);
    }
    if (method === "POST" && url === "/resetPlayersForNewGame") {
      if (!requireGrandmaster(req, res)) return;
      return resetPlayersForNewGame(req, res, appDir);
    }
    if (method === "POST" && url === "/updateScore") {
      if (!requireGrandmaster(req, res)) return;
      return updatePlayerScore(req, res, appDir);
    }
    if (method === "POST" && url === "/setScore") {
      if (!requireGrandmaster(req, res)) return;
      return setPlayerScore(req, res, appDir);
    }
    if (method === "POST" && url === "/reorderPlayers") {
      if (!requireGrandmaster(req, res)) return;
      return reorderPlayers(req, res, appDir);
    }
    if (method === "POST" && url === "/createUser") {
      if (!requireGrandmaster(req, res)) return;
      return handleCreateUser(req, res);
    }
    if (method === "GET" && url === "/api/users") {
      if (!requireAuth(req, res)) return;
      return handleGetUsers(req, res);
    }
    if (method === "GET" && url === "/api/user-role") {
      return handleGetUserRole(req, res);
    }
    if (method === "GET" && url === "/api/leaderboard") {
      return getLeaderboard(res);
    }
    if (method === "GET" && url === "/playerNames") {
      return getPlayerNames(res, appDir);
    }
    if (method === "GET" && url === "/groups") {
      return getGroups(res);
    }
    if (method === "GET" && url === "/listGames") {
      return listGames(res, appDir);
    }
    if (method === "GET" && url === "/getGameName") {
      return getGameName(res);
    }
    if (method === "GET" && url === "/getGameType") {
      return getGameType(res);
    }
    if (method === "GET" && url === "/getRound") {
      return getRound(res);
    }
    if (method === "POST" && url === "/setRound") {
      if (!requireGrandmaster(req, res)) return;
      return setRound(req, res, appDir);
    }
    if (method === "POST" && url === "/saveGame") {
      if (!requireGrandmaster(req, res)) return;
      return saveGameInstance(req, res, appDir);
    }
    if (method === "POST" && url === "/createGroups") {
      if (!requireGrandmaster(req, res)) return;
      return createGroups(req, res, appDir);
    }
    if (method === "POST" && url === "/setGroupName") {
      if (!requireGrandmaster(req, res)) return;
      return setGroupName(req, res, appDir);
    }
    if (method === "POST" && url === "/startGameWithGroups") {
      if (!requireGrandmaster(req, res)) return;
      return startGameWithGroups(req, res, appDir);
    }
    if (method === "POST" && url === "/addPlayer") {
      if (!requireGrandmaster(req, res)) return;
      return addPlayer(req, res, appDir);
    }
    if (method === "POST" && url === "/markGameInactive") {
      if (!requireGrandmaster(req, res)) return;
      return markGameInactive(req, res, appDir);
    }
    if (method === "GET" && (url === "/" || url === "/index.html")) {
      if (!requireGrandmaster(req, res)) return;
      return homeRoute(res, appDir);
    }
    if (method === "GET" && pathname === "/enterNames") {
      if (!requireGrandmaster(req, res)) return;
      return renderEnterNames(res, appDir);
    }
    if (method === "GET" && pathname === "/game") {
      if (!requireGrandmaster(req, res)) return;
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
        return;
      } else {
        try {
          const game = getGame();
          const gameType = game.getGameType();
          return renderGamePage(res, appDir, gameType);
        } catch (err) {
          console.error("Error getting game type:", err);
          return renderGamePage(res, appDir, "quiz");
        }
      }
    }
    if (method === "GET" && url === "/leaderboard") {
      return renderLeaderboard(res, appDir);
    }
    if (method === "POST" && url === "/endGame") {
      return saveGame(appDir).then(() => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      });
    }
    if (method === "GET" && url?.startsWith("/public/")) {
      return serveStatic(req, res, appDir);
    }

    res.writeHead(404);
    res.end("Not Found");
  };
}

/**
 * Create and initialize the HTTP server.
 * @returns {Promise<http.Server>} The initialized HTTP server.
 */
export async function createServer(): Promise<http.Server> {
  await initializeGame(appDir);
  return http.createServer(createRequestListener());
}
