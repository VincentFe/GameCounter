import fs from "fs";
import path from "path";
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