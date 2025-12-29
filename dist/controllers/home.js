import fs from "fs";
import path from "path";
/**
 * Render the home page (index.html).
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {void}
 */
export default function homeRoute(res, baseDir) {
    const file = path.join(baseDir, "..", "src", "public", "index.html");
    fs.readFile(file, (err, data) => {
        if (err) {
            res.writeHead(500);
            res.end("Error loading homepage");
            return;
        }
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
    });
}
//# sourceMappingURL=home.js.map