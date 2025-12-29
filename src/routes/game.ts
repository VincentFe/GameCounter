import fs from "fs";
import path from "path";
import { ServerResponse } from "http";

export async function renderGamePage(
  res: ServerResponse,
  baseDir: string,
  gameType: string = "quiz"
): Promise<void> {
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
