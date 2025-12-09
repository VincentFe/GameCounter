import http from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import homeRoute from "./routes/home.js";
import { renderEnterNames, saveName, getPlayers, deletePlayer } from "./routes/enterNames.js";
import { serveStatic } from "./routes/static.js";

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

  //
  // ────────────────────────────────────────────────────────────────
  // 3. STATIC FILES (CSS, JS, images, etc.)
  // ────────────────────────────────────────────────────────────────
  //
  if (method === "GET" && url.startsWith("/public/")) {
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

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
