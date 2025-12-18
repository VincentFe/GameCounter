/**
 * Server Module
 * Main HTTP server for the GameCounter application.
 * Sets up routing for API endpoints, page routes, and static file serving.
 * Initializes the game instance on startup.
 */
// Import necessary modules
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
// Import route handlers
import * as homePage from "./routes/home.js";
import * as enterNamesPage from "./routes/enterNames.js";
import * as staticFileHandler from "./routes/static.js";
import * as renderGamePage from "./routes/game.js";
import * as leaderboardPage from "./routes/leaderboard.js";
import { gameManager } from "./gameManager.js";
import * as playerPage from "./routes/enterNames.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = 3000;
/**
 * HTTP Request Handler
 * Routes incoming HTTP requests to appropriate handlers based on method and URL path.
 * Organizes routes into sections: API routes, page routes, static files, and error handling.
 * @param req The incoming HTTP request
 * @param res The HTTP response object
 */
async function handleRequest(req, res) {
    const { method, url } = req;
    // Parse URL to separate path from query string
    const urlParts = url?.split("?") || [];
    const pathname = urlParts[0];
    const queryString = urlParts[1] || "";
    // Helper to get query param
    function getQueryParam(key) {
        const params = new URLSearchParams(queryString);
        return params.get(key);
    }
    //
    // ────────────────────────────────────────────────────────────────
    // 1. API ROUTES (must be FIRST)
    // ────────────────────────────────────────────────────────────────
    //
    if (method === "GET" && url === "/players") {
        return enterNamesPage.getPlayers(res, __dirname);
    }
    if (method === "POST" && url === "/saveName") {
        return enterNamesPage.saveName(req, res, __dirname);
    }
    if (method === "POST" && url === "/setGameName") {
        return enterNamesPage.setGameName(req, res, __dirname);
    }
    if ((method === "POST" || method === "DELETE") && url === "/deletePlayer") {
        return enterNamesPage.deletePlayer(req, res, __dirname);
    }
    if (method === "POST" && url === "/updateScore") {
        return enterNamesPage.updatePlayerScore(req, res, __dirname);
    }
    if (method === "POST" && url === "/setScore") {
        return enterNamesPage.setPlayerScore(req, res, __dirname);
    }
    if (method === "GET" && url === "/api/leaderboard") {
        return await leaderboardPage.getLeaderboard(res);
    }
    if (method === "GET" && url === "/playerNames") {
        return playerPage.getPlayerNames(res, __dirname);
    }
    if (method === "GET" && url === "/listGames") {
        return enterNamesPage.listGames(res, __dirname);
    }
    if (method === "GET" && url === "/getGameName") {
        return enterNamesPage.getGameName(res);
    }
    if (method === "POST" && url === "/saveGame") {
        return enterNamesPage.saveGameInstance(req, res, __dirname);
    }
    if (method === "POST" && url === "/addPlayer") {
        return enterNamesPage.addPlayer(req, res, __dirname);
    }
    if (method === "POST" && url === "/markGameInactive") {
        return enterNamesPage.markGameInactive(req, res, __dirname);
    }
    //
    // ────────────────────────────────────────────────────────────────
    // 2. PAGE ROUTES
    // ────────────────────────────────────────────────────────────────
    //
    if (method === "GET" && (url === "/" || url === "/index.html")) {
        return homePage.homeRoute(res, __dirname);
    }
    if (method === "GET" && url === "/enterNames") {
        return enterNamesPage.renderEnterNames(res, __dirname);
    }
    if (method === "GET" && pathname === "/game") {
        const gameName = getQueryParam("game");
        if (gameName) {
            // Load the specified game before rendering
            gameManager
                .loadGameByName(__dirname, gameName)
                .then(() => renderGamePage.renderGamePage(res, __dirname))
                .catch((err) => {
                console.error("Failed to load game:", err);
                res.writeHead(500);
                res.end("Failed to load game");
            });
            return; // Prevent falling through to other handlers
        }
        else {
            // No game specified, just render with current game instance
            return renderGamePage.renderGamePage(res, __dirname);
        }
    }
    if (method === "GET" && url === "/leaderboard") {
        return leaderboardPage.renderLeaderboard(res, __dirname);
    }
    if (method === "POST" && url === "/endGame") {
        return gameManager.saveGame(__dirname).then(() => {
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
        return staticFileHandler.serveStatic(req, res, __dirname);
    }
    //
    // ────────────────────────────────────────────────────────────────
    // 4. 404 Not Found
    // ────────────────────────────────────────────────────────────────
    //
    res.writeHead(404);
    res.end("Not Found");
}
const server = http.createServer(handleRequest);
// Initialize game instance on server startup and start listening for requests
(async () => {
    try {
        // Initialize the game singleton before accepting requests
        await gameManager.initialize(__dirname);
        console.log("✅ Game instance initialized");
    }
    catch (err) {
        console.error("Failed to initialize game:", err);
    }
    // Start the server on the configured port
    server.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
})();
//# sourceMappingURL=server.js.map