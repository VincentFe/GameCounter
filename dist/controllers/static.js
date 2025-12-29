import fs from "fs";
import path from "path";
/**
 * Serve static files (HTML, CSS, JS, images, etc.) from the public directory.
 * Maps file extensions to appropriate MIME types.
 * @param {IncomingMessage} req - HTTP request object containing the file path in req.url.
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {void}
 */
export function serveStatic(req, res, baseDir) {
    const filePath = path.join(baseDir, "..", "src", req.url || "");
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end("File Not Found");
            return;
        }
        const ext = path.extname(filePath).toLowerCase();
        const types = {
            ".html": "text/html",
            ".js": "application/javascript",
            ".css": "text/css",
            ".json": "application/json",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
        };
        res.writeHead(200, {
            "Content-Type": types[ext] || "application/octet-stream",
        });
        res.end(data);
    });
}
//# sourceMappingURL=static.js.map