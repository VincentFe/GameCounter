/**
 * Home Route Handler
 * Renders the home/index page of the application.
 */
import fs from "fs";
import path from "path";
/**
 * Serves the home page (index.html).
 * @param res The HTTP response object
 * @param baseDir The base directory path for the application
 */
export function homeRoute(res, baseDir) {
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