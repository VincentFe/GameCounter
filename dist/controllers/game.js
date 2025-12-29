import fs from "fs";
import path from "path";
/**
 * Render the appropriate game page based on game type.
 * Serves either gameQuiz.html (default) or gameChineesPoepeke.html.
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @param {string} [gameType="quiz"] - The game type to determine which HTML file to serve.
 * @returns {Promise<void>} Resolves when response is sent.
 */
export async function renderGamePage(res, baseDir, gameType = "quiz") {
    const fileName = gameType === "chinees poepeke" ? "gameChineesPoepeke.html" : "gameQuiz.html";
    const file = path.join(baseDir, "..", "src", "public", fileName);
    fs.readFile(file, (err, data) => {
        if (err) {
            res.writeHead(500);
            res.end("Error loading game page");
            return;
        }
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
    });
}
//# sourceMappingURL=game.js.map