import fs from "fs";
import path from "path";
import { ServerResponse } from "http";

export default function homeRoute(
  res: ServerResponse,
  baseDir: string
): void {
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
