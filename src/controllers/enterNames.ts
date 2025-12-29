import fs from "fs";
import path from "path";
import { IncomingMessage, ServerResponse } from "http";
import * as GameService from "../model/GameService.js";

/**
 * Helper function to parse JSON from request body.
 * Reads the entire request stream and parses it as JSON.
 * @param {IncomingMessage} req - The HTTP request object.
 * @returns {Promise<any>} A promise resolving to the parsed JSON object.
 * @throws {Error} If JSON parsing fails.
 */
async function readJsonBody(req: IncomingMessage): Promise<any> {
	return new Promise((resolve, reject) => {
		let body = "";
		req.on("data", (chunk) => (body += chunk.toString()));
		req.on("end", () => {
			try {
				const parsed = JSON.parse(body || "{}");
				resolve(parsed);
			} catch (e) {
				reject(new Error("Invalid JSON"));
			}
		});
		req.on("error", (err) => reject(err));
	});
}

/**
 * Render the enterNames.html page.
 * Optionally injects initial player data into a window.__initialPlayers script variable.
 * @param {ServerResponse} res - The HTTP response object.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @param {Array<{ name: string; score?: number }>} [initialPlayers] - Optional initial players to inject.
 * @returns {void}
 */
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
		if (initialPlayers && initialPlayers.length > 0) {
			const playersJson = JSON.stringify(initialPlayers);
			const script = `<script>window.__initialPlayers = ${playersJson};</script>`;
			html = html.replace("</head>", `${script}</head>`);
		}
		res.writeHead(200, { "Content-Type": "text/html" });
		res.end(html);
	});
}

/**
 * Add a player to the current game.
 * Validates and delegates to GameService.addPlayerByName().
 * @param {IncomingMessage} req - HTTP request with JSON body { name: string }.
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<void>} Resolves when response is sent.
 */
export async function saveName(req: IncomingMessage, res: ServerResponse, baseDir: string): Promise<void> {
	try {
		const parsed = await readJsonBody(req);
		const name = (parsed.name || "").toString().trim();
		if (!name) {
			res.writeHead(400);
			res.end(JSON.stringify({ ok: false, error: "Name empty" }));
			return;
		}
		const result = await GameService.addPlayerByName(baseDir, name);
		if (!result.ok) {
			const status = /not found/i.test(result.error || "") ? 404 : 400;
			res.writeHead(status, { "Content-Type": "application/json" });
			res.end(JSON.stringify(result));
			return;
		}
		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ ok: true }));
	} catch (err: any) {
		res.writeHead(400);
		res.end(JSON.stringify({ ok: false, error: err.message || "Invalid JSON" }));
	}
}

/**
 * Set the game's name.
 * Validates and delegates to GameService.setGameName().
 * @param {IncomingMessage} req - HTTP request with JSON body { name: string }.
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<void>} Resolves when response is sent.
 */
export async function setGameName(req: IncomingMessage, res: ServerResponse, baseDir: string): Promise<void> {
	try {
		const parsed = await readJsonBody(req);
		const name = (parsed.name || "").toString().trim();
		if (!name) {
			res.writeHead(400);
			res.end(JSON.stringify({ ok: false, error: "Name empty" }));
			return;
		}
		await GameService.setGameName(baseDir, name);
		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ ok: true }));
	} catch (err: any) {
		res.writeHead(400);
		res.end(JSON.stringify({ ok: false, error: err.message || "Invalid JSON" }));
	}
}

/**
 * Set the game's type.
 * Validates and delegates to GameService.setGameType().
 * @param {IncomingMessage} req - HTTP request with JSON body { type: string }.
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<void>} Resolves when response is sent.
 */
export async function setGameType(req: IncomingMessage, res: ServerResponse, baseDir: string): Promise<void> {
	try {
		const parsed = await readJsonBody(req);
		const type = (parsed.type || "").toString().trim();
		if (!type) {
			res.writeHead(400);
			res.end(JSON.stringify({ ok: false, error: "Type empty" }));
			return;
		}
		await GameService.setGameType(baseDir, type);
		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ ok: true }));
	} catch (err: any) {
		res.writeHead(400);
		res.end(JSON.stringify({ ok: false, error: err.message || "Invalid JSON" }));
	}
}

/**
 * Get all players and their scores from the current game.
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} [baseDir] - Optional base directory (unused).
 * @returns {void}
 */
export function getPlayers(res: ServerResponse, baseDir?: string): void {
	try {
		const players = GameService.getPlayers();
		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(JSON.stringify(players));
	} catch (err) {
		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(JSON.stringify([]));
	}
}

/**
 * Get all player names from the current game.
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} [baseDir] - Optional base directory (unused).
 * @returns {void}
 */
export function getPlayerNames(res: ServerResponse, baseDir?: string): void {
	try {
		const names = GameService.getPlayerNames();
		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(JSON.stringify(names));
	} catch (err) {
		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(JSON.stringify([]));
	}
}

/**
 * Delete a player from the current game.
 * Validates and delegates to GameService.deletePlayerByName().
 * @param {IncomingMessage} req - HTTP request with JSON body { name: string }.
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<void>} Resolves when response is sent.
 */
export async function deletePlayer(req: IncomingMessage, res: ServerResponse, baseDir: string): Promise<void> {
	try {
		const parsed = await readJsonBody(req);
		const name = (parsed.name || "").toString().trim();
		if (!name) {
			res.writeHead(400);
			res.end(JSON.stringify({ ok: false, error: "Name empty" }));
			return;
		}
		const result = await GameService.deletePlayerByName(baseDir, name);
		if (!result.ok) {
			const status = /not found/i.test(result.error || "") ? 404 : 400;
			res.writeHead(status);
			res.end(JSON.stringify(result));
			return;
		}
		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ ok: true }));
	} catch (err: any) {
		res.writeHead(400);
		res.end(JSON.stringify({ ok: false, error: err.message || "Invalid JSON" }));
	}
}

/**
 * Remove all players from the current game.
 * @param {IncomingMessage} req - HTTP request object.
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<void>} Resolves when response is sent.
 */
export async function removeAllPlayers(req: IncomingMessage, res: ServerResponse, baseDir: string): Promise<void> {
	try {
		await GameService.removeAllPlayers(baseDir);
		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ ok: true }));
	} catch (err) {
		res.writeHead(500);
		res.end(JSON.stringify({ ok: false, error: "Failed to remove all players" }));
	}
}

/**
 * Update a player's score by adding a delta.
 * Supports optional history value logging.
 * @param {IncomingMessage} req - HTTP request with JSON body { name: string; score: number; historyValue?: number }.
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<void>} Resolves when response is sent.
 */
export async function updatePlayerScore(req: IncomingMessage, res: ServerResponse, baseDir: string): Promise<void> {
	try {
		const parsed = await readJsonBody(req);
		const name = (parsed.name || "").toString().trim();
		const score = typeof parsed.score === "number" ? parsed.score : undefined;
		const historyValue = typeof parsed.historyValue === "number" ? parsed.historyValue : undefined;
		if (!name || score === undefined) {
			res.writeHead(400);
			res.end(JSON.stringify({ ok: false, error: "Name and score required" }));
			return;
		}
		const result = await GameService.updatePlayerScore(baseDir, name, score, historyValue);
		if (!result.ok) {
			res.writeHead(400);
			res.end(JSON.stringify(result));
			return;
		}
		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ ok: true }));
	} catch (err: any) {
		res.writeHead(400);
		res.end(JSON.stringify({ ok: false, error: err.message || "Invalid JSON" }));
	}
}

/**
 * Set a player's score to an absolute value.
 * Validates and delegates to GameService.setPlayerScore().
 * @param {IncomingMessage} req - HTTP request with JSON body { name: string; score: number }.
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<void>} Resolves when response is sent.
 */
export async function setPlayerScore(req: IncomingMessage, res: ServerResponse, baseDir: string): Promise<void> {
	try {
		const parsed = await readJsonBody(req);
		const name = (parsed.name || "").toString().trim();
		const score = typeof parsed.score === "number" ? parsed.score : undefined;
		if (!name || score === undefined) {
			res.writeHead(400);
			res.end(JSON.stringify({ ok: false, error: "Name and score required" }));
			return;
		}
		const result = await GameService.setPlayerScore(baseDir, name, score);
		if (!result.ok) {
			res.writeHead(400);
			res.end(JSON.stringify(result));
			return;
		}
		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ ok: true }));
	} catch (err: any) {
		res.writeHead(400);
		res.end(JSON.stringify({ ok: false, error: err.message || "Invalid JSON" }));
	}
}

/**
 * List all active games from the db folder.
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {void}
 */
export function listGames(res: ServerResponse, baseDir: string): void {
	try {
		const games = GameService.listGames(baseDir);
		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(JSON.stringify(games));
	} catch (err) {
		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(JSON.stringify([]));
	}
}

/**
 * Save the current game instance to file.
 * @param {IncomingMessage} req - HTTP request object.
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<void>} Resolves when response is sent.
 */
export async function saveGameInstance(req: IncomingMessage, res: ServerResponse, baseDir: string): Promise<void> {
	try {
		await GameService.saveGameInstance(baseDir);
		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ ok: true }));
	} catch (err) {
		res.writeHead(500);
		res.end(JSON.stringify({ ok: false, error: "Failed to save game" }));
	}
}

/**
 * Add a player to the current game (wrapper for saveName).
 * @param {IncomingMessage} req - HTTP request with JSON body { name: string }.
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<void>} Resolves when response is sent.
 */
export async function addPlayer(req: IncomingMessage, res: ServerResponse, baseDir: string): Promise<void> {
	try {
		const parsed = await readJsonBody(req);
		const name = (parsed.name || "").toString().trim();
		if (!name) {
			res.writeHead(400);
			res.end(JSON.stringify({ ok: false, error: "Name empty" }));
			return;
		}
		const result = await GameService.addPlayerByName(baseDir, name);
		if (!result.ok) {
			res.writeHead(400);
			res.end(JSON.stringify(result));
			return;
		}
		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ ok: true }));
	} catch (err: any) {
		res.writeHead(400);
		res.end(JSON.stringify({ ok: false, error: err.message || "Invalid JSON" }));
	}
}

/**
 * Mark the current game as inactive.
 * @param {IncomingMessage} req - HTTP request object.
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<void>} Resolves when response is sent.
 */
export async function markGameInactive(req: IncomingMessage, res: ServerResponse, baseDir: string): Promise<void> {
	try {
		await GameService.markGameInactive(baseDir);
		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ ok: true }));
	} catch (err) {
		res.writeHead(500);
		res.end(JSON.stringify({ ok: false, error: "Failed to mark game inactive" }));
	}
}

/**
 * Get the current game's name.
 * @param {ServerResponse} res - HTTP response object.
 * @returns {void}
 */
export function getGameName(res: ServerResponse): void {
	try {
		const name = GameService.getGameName();
		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ name }));
	} catch (err) {
		res.writeHead(500);
		res.end(JSON.stringify({ ok: false, error: "Failed to get game name" }));
	}
}

/**
 * Get the current game's type.
 * @param {ServerResponse} res - HTTP response object.
 * @returns {void}
 */
export function getGameType(res: ServerResponse): void {
	try {
		const type = GameService.getGameType();
		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ type }));
	} catch (err) {
		res.writeHead(500);
		res.end(JSON.stringify({ ok: false, error: "Failed to get game type" }));
	}
}

/**
 * Get the current round number.
 * @param {ServerResponse} res - HTTP response object.
 * @returns {void}
 */
export function getRound(res: ServerResponse): void {
	try {
		const round = GameService.getRound();
		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ round }));
	} catch (err) {
		res.writeHead(500);
		res.end(JSON.stringify({ ok: false, error: "Failed to get round" }));
	}
}

/**
 * Set the round number.
 * Validates and delegates to GameService.setRound().
 * @param {IncomingMessage} req - HTTP request with JSON body { round: number }.
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {Promise<void>} Resolves when response is sent.
 */
export async function setRound(req: IncomingMessage, res: ServerResponse, baseDir: string): Promise<void> {
	try {
		const parsed = await readJsonBody(req);
		const round = typeof parsed.round === "number" ? parsed.round : undefined;
		if (round === undefined) {
			res.writeHead(400);
			res.end(JSON.stringify({ ok: false, error: "Round required" }));
			return;
		}
		await GameService.setRound(baseDir, round);
		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ ok: true }));
	} catch (err: any) {
		res.writeHead(400);
		res.end(JSON.stringify({ ok: false, error: err.message || "Invalid JSON" }));
	}
}

export default {};


