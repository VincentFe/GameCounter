import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import homeRoute from "./controllers/home.js";
import { renderEnterNames, saveName, setGameName, setGameType, getPlayers, deletePlayer, updatePlayerScore, setPlayerScore, getPlayerNames, listGames, saveGameInstance, addPlayer, markGameInactive, getGameName, getGameType, getRound, setRound, removeAllPlayers, } from "./controllers/enterNames.js";
import { serveStatic } from "./controllers/static.js";
import { renderGamePage } from "./controllers/game.js";
import { renderLeaderboard, getLeaderboard } from "./controllers/leaderboard.js";
import { initializeGame, saveGame, loadGameByName, getGame } from "./model/gameManager.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = 3000;
const server = http.createServer((req, res) => {
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
        return getPlayers(res, __dirname);
    }
    if (method === "POST" && url === "/saveName") {
        return saveName(req, res, __dirname);
    }
    if (method === "POST" && url === "/setGameName") {
        return setGameName(req, res, __dirname);
    }
    if (method === "POST" && url === "/setGameType") {
        return setGameType(req, res, __dirname);
    }
    if ((method === "POST" || method === "DELETE") && url === "/deletePlayer") {
        return deletePlayer(req, res, __dirname);
    }
    if (method === "POST" && url === "/removeAllPlayers") {
        return removeAllPlayers(req, res, __dirname);
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
        return setRound(req, res);
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
});
// Initialize game instance on server startup
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