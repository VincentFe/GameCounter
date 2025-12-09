import fs from "fs";
import path from "path";

export default function homeRoute(res, baseDir) {
  const file = path.join(baseDir, "public", "index.html");

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
