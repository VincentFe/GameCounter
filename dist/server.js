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
import homeRoute from "./controllers/home.js";
import { renderEnterNames, saveName, setGameName, setGameType, startGameWithGroups, createGroups, getGroups, setGroupName, getPlayers, deletePlayer, updatePlayerScore, setPlayerScore, reorderPlayers, getPlayerNames, listGames, saveGameInstance, addPlayer, markGameInactive, getGameName, getGameType, getRound, setRound, removeAllPlayers, resetPlayersForNewGame, } from "./controllers/enterNames.js";
import { serveStatic } from "./controllers/static.js";
import { renderGamePage } from "./controllers/game.js";
import { renderLeaderboard, getLeaderboard } from "./controllers/leaderboard.js";
import { initializeGame, saveGame, loadGameByName, getGame } from "./model/gameManager.js";
import * as UserService from "./model/UserService.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = 3000;
/**
 * Get session ID from cookies.
 * @param {IncomingMessage} req - The request object.
 * @returns {string|null} The session ID or null.
 */
function getSessionId(req) {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader)
        return null;
    const cookies = cookieHeader.split(";").map(c => c.trim());
    const sessionCookie = cookies.find(c => c.startsWith("sessionId="));
    return sessionCookie ? sessionCookie.split("=")[1] : null;
}
/**
 * Get current user from session.
 * @param {IncomingMessage} req - The request object.
 * @returns {User|null} The authenticated user or null.
 */
function getCurrentUser(req) {
    const sessionId = getSessionId(req);
    return sessionId ? UserService.getUserFromSession(sessionId) : null;
}
/**
 * Middleware to require authentication.
 * @param {IncomingMessage} req - The request object.
 * @param {ServerResponse} res - The response object.
 * @returns {boolean} True if authenticated, false otherwise (and response sent).
 */
function requireAuth(req, res) {
    const user = getCurrentUser(req);
    if (!user) {
        res.writeHead(302, { "Location": "/login" });
        res.end();
        return false;
    }
    return true;
}
/**
 * Middleware to require grandmaster role.
 * @param {IncomingMessage} req - The request object.
 * @param {ServerResponse} res - The response object.
 * @returns {boolean} True if grandmaster, false otherwise (and response sent).
 */
function requireGrandmaster(req, res) {
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
 * @param {string} baseDir - The base directory.
 */
function renderLoginPage(res, baseDir) {
    const file = path.join(baseDir, "..", "src", "public", "login.html");
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
 * Handle login POST request.
 * @param {IncomingMessage} req - The request object.
 * @param {ServerResponse} res - The response object.
 */
async function handleLogin(req, res) {
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
        const user = await UserService.authenticate(__dirname, username, password);
        if (user) {
            const sessionId = UserService.createSession(user);
            res.writeHead(302, {
                "Location": "/",
                "Set-Cookie": `sessionId=${sessionId}; HttpOnly; Path=/; Max-Age=86400`, // 24 hours
            });
            res.end();
        }
        else {
            res.writeHead(401);
            res.end("Invalid username or password");
        }
    });
}
/**
 * Handle logout POST request.
 * @param {IncomingMessage} req - The request object.
 * @param {ServerResponse} res - The response object.
 */
function handleLogout(req, res) {
    const sessionId = getSessionId(req);
    if (sessionId) {
        UserService.destroySession(sessionId);
    }
    res.writeHead(302, {
        "Location": "/login",
        "Set-Cookie": "sessionId=; HttpOnly; Path=/; Max-Age=0",
    });
    res.end();
}
/**
 * Handle create user POST request.
 * @param {IncomingMessage} req - The request object.
 * @param {ServerResponse} res - The response object.
 */
async function handleCreateUser(req, res) {
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
        const result = await UserService.createUser(__dirname, username, password, isGrandmaster);
        if (result.ok) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "User created successfully" }));
        }
        else {
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
function handleGetUserRole(req, res) {
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
async function handleGetUsers(req, res) {
    const users = await UserService.getAllUsers(__dirname);
    const safeUsers = users.map((user) => ({
        guid: user.guid,
        username: user.username,
        role: user.isGrandmaster() ? "grandmaster" : "user",
    }));
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(safeUsers));
}
const server = http.createServer((req, res) => {
    const { method, url } = req;
    // Parse URL to separate path from query string
    const urlParts = url?.split("?") || [];
    const pathname = urlParts[0];
    const queryString = urlParts[1] || "";
    // Helper to extract query parameter value
    function getQueryParam(key) {
        const params = new URLSearchParams(queryString);
        return params.get(key);
    }
    // Login routes (no auth required)
    if (method === "GET" && pathname === "/login") {
        return renderLoginPage(res, __dirname);
    }
    if (method === "POST" && pathname === "/login") {
        return handleLogin(req, res);
    }
    if (method === "POST" && pathname === "/logout") {
        return handleLogout(req, res);
    }
    // Check authentication for all other routes
    if (!requireAuth(req, res))
        return;
    //
    // ────────────────────────────────────────────────────────────────
    // 1. API ROUTES (must be FIRST to prevent conflicts with page routes)
    // ────────────────────────────────────────────────────────────────
    //
    // Get all players with scores
    if (method === "GET" && url === "/players") {
        if (!requireGrandmaster(req, res))
            return;
        return getPlayers(res, __dirname);
    }
    // Add a player to the current game
    if (method === "POST" && url === "/saveName") {
        if (!requireGrandmaster(req, res))
            return;
        return saveName(req, res, __dirname);
    }
    // Set the game's name
    if (method === "POST" && url === "/setGameName") {
        if (!requireGrandmaster(req, res))
            return;
        return setGameName(req, res, __dirname);
    }
    // Set the game's type (quiz or chinees poepeke)
    if (method === "POST" && url === "/setGameType") {
        if (!requireGrandmaster(req, res))
            return;
        return setGameType(req, res, __dirname);
    }
    // Delete a player from the current game
    if ((method === "POST" || method === "DELETE") && url === "/deletePlayer") {
        if (!requireGrandmaster(req, res))
            return;
        return deletePlayer(req, res, __dirname);
    }
    // Remove all players from the current game
    if (method === "POST" && url === "/removeAllPlayers") {
        if (!requireGrandmaster(req, res))
            return;
        return removeAllPlayers(req, res, __dirname);
    }
    // Reset players list for starting a new game (provide names array)
    if (method === "POST" && url === "/resetPlayersForNewGame") {
        if (!requireGrandmaster(req, res))
            return;
        return resetPlayersForNewGame(req, res, __dirname);
    }
    // Update a player's score (add delta)
    if (method === "POST" && url === "/updateScore") {
        if (!requireGrandmaster(req, res))
            return;
        return updatePlayerScore(req, res, __dirname);
    }
    // Set a player's score to absolute value
    if (method === "POST" && url === "/setScore") {
        if (!requireGrandmaster(req, res))
            return;
        return setPlayerScore(req, res, __dirname);
    }
    // Reorder players
    if (method === "POST" && url === "/reorderPlayers") {
        if (!requireGrandmaster(req, res))
            return;
        return reorderPlayers(req, res, __dirname);
    }
    // Create a new user (grandmaster only)
    if (method === "POST" && url === "/createUser") {
        if (!requireGrandmaster(req, res))
            return;
        return handleCreateUser(req, res);
    }
    if (method === "GET" && url === "/api/users") {
        if (!requireAuth(req, res))
            return;
        return handleGetUsers(req, res);
    }
    // Get current user role
    if (method === "GET" && url === "/api/user-role") {
        return handleGetUserRole(req, res);
    }
    // Get leaderboard (players sorted by score)
    if (method === "GET" && url === "/api/leaderboard") {
        return getLeaderboard(res);
    }
    // Get all player names
    if (method === "GET" && url === "/playerNames") {
        return getPlayerNames(res, __dirname);
    }
    // Get groups
    if (method === "GET" && url === "/groups") {
        return getGroups(res);
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
        if (!requireGrandmaster(req, res))
            return;
        return setRound(req, res, __dirname);
    }
    // Save the current game instance to file
    if (method === "POST" && url === "/saveGame") {
        if (!requireGrandmaster(req, res))
            return;
        return saveGameInstance(req, res, __dirname);
    }
    // Create groups
    if (method === "POST" && url === "/createGroups") {
        if (!requireGrandmaster(req, res))
            return;
        return createGroups(req, res, __dirname);
    }
    // Set group name
    if (method === "POST" && url === "/setGroupName") {
        if (!requireGrandmaster(req, res))
            return;
        return setGroupName(req, res, __dirname);
    }
    // Start a quiz using groups as players
    if (method === "POST" && url === "/startGameWithGroups") {
        if (!requireGrandmaster(req, res))
            return;
        return startGameWithGroups(req, res, __dirname);
    }
    // Add a player (alias for /saveName)
    if (method === "POST" && url === "/addPlayer") {
        if (!requireGrandmaster(req, res))
            return;
        return addPlayer(req, res, __dirname);
    }
    // Mark the current game as inactive
    if (method === "POST" && url === "/markGameInactive") {
        if (!requireGrandmaster(req, res))
            return;
        return markGameInactive(req, res, __dirname);
    }
    //
    // ────────────────────────────────────────────────────────────────
    // 2. PAGE ROUTES (HTML pages)
    // ────────────────────────────────────────────────────────────────
    //
    // Home page
    if (method === "GET" && (url === "/" || url === "/index.html")) {
        if (!requireGrandmaster(req, res))
            return;
        return homeRoute(res, __dirname);
    }
    // Enter names page (match pathname so query params are supported)
    if (method === "GET" && pathname === "/enterNames") {
        if (!requireGrandmaster(req, res))
            return;
        return renderEnterNames(res, __dirname);
    }
    // Game page (supports loading existing game via ?game=<name> query param)
    if (method === "GET" && pathname === "/game") {
        if (!requireGrandmaster(req, res))
            return;
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
        }
        else {
            // No game specified, just render with current game instance
            try {
                const game = getGame();
                const gameType = game.getGameType();
                return renderGamePage(res, __dirname, gameType);
            }
            catch (err) {
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
});
// Initialize game instance and start server
(async () => {
    try {
        await initializeGame(__dirname);
        console.log("✅ Game instance initialized");
    }
    catch (err) {
        console.error("Failed to initialize game:", err);
    }
    server.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
})();
//# sourceMappingURL=server.js.map