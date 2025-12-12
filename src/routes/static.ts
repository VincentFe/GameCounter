import fs from "fs";
import path from "path";
import { IncomingMessage, ServerResponse } from "http";

export function serveStatic(
  req: IncomingMessage,
  res: ServerResponse,
  baseDir: string
): void {
  const filePath = path.join(baseDir, "..", "src", req.url || "");

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("File Not Found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();

    const types: Record<string, string> = {
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
