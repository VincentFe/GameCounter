import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import homeRoute from "./routes/home.js";
import { renderEnterNames, saveName, getPlayers, deletePlayer, updatePlayerScore, setPlayerScore, getPlayerNames, } from "./routes/enterNames.js";
import { serveStatic } from "./routes/static.js";
import { renderGamePage } from "./routes/game.js";
import { initializeGame } from "./gameManager.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = 3000;
const server = http.createServer((req, res) => {
    const { method, url } = req;
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
    if ((method === "POST" || method === "DELETE") && url === "/deletePlayer") {
        return deletePlayer(req, res, __dirname);
    }
    if (method === "POST" && url === "/updateScore") {
        return updatePlayerScore(req, res, __dirname);
    }
    if (method === "POST" && url === "/setScore") {
        return setPlayerScore(req, res, __dirname);
    }
    if (method === "GET" && url === "/playerNames") {
        return getPlayerNames(res, __dirname);
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
    if (method === "GET" && url === "/game") {
        return renderGamePage(res, __dirname);
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