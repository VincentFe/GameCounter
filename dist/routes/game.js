import fs from "fs";
import path from "path";
export function renderGamePage(res, baseDir) {
    const file = path.join(baseDir, "..", "src", "public", "game.html");
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