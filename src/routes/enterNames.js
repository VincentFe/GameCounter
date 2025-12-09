import fs from "fs";
import path from "path";

export function renderEnterNames(res, baseDir) {
  const file = path.join(baseDir, "public", "enterNames.html");

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end("Error loading enter names page");
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(data);
  });
}

export function saveName(req, res, baseDir) {
  let body = "";
  req.on("data", chunk => {
    body += chunk.toString();
  });

  req.on("end", () => {
    let name = "";
    try {
      const parsed = JSON.parse(body || "{}");
      name = (parsed.name || "").toString().trim();
    } catch (e) {
      res.writeHead(400);
      res.end(JSON.stringify({ ok: false, error: "Invalid JSON" }));
      return;
    }

    if (!name) {
      res.writeHead(400);
      res.end(JSON.stringify({ ok: false, error: "Name empty" }));
      return;
    }

    // ensure db folder exists (db is sibling to src)
    const dbDir = path.join(baseDir, "..", "db");
    const filePath = path.join(dbDir, "names.txt");

    fs.mkdir(dbDir, { recursive: true }, (mkErr) => {
      if (mkErr) {
        res.writeHead(500);
        res.end(JSON.stringify({ ok: false, error: "Failed to create db folder" }));
        return;
      }

      // append name with newline
      fs.appendFile(filePath, name + "\n", (err) => {
        if (err) {
          res.writeHead(500);
          res.end(JSON.stringify({ ok: false, error: "Failed to save name" }));
          return;
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      });
    });
  });

  req.on("error", () => {
    res.writeHead(500);
    res.end(JSON.stringify({ ok: false, error: "Request error" }));
  });
}

export function getPlayers(res, baseDir) {

  if (res.headersSent) return;

  const filePath = path.join(baseDir, "..", "db", "names.txt");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (res.headersSent) return;

    const players = !err && data
      ? data.split("\n").map(x => x.trim()).filter(Boolean)
      : [];

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(players));
  });
}

export function deletePlayer(req, res, baseDir) {
  // expect JSON body like { name: "Player Name" }
  let body = "";
  req.on("data", chunk => { body += chunk.toString(); });
  req.on("end", () => {
    let name = "";
    try {
      const parsed = JSON.parse(body || "{}");
      name = (parsed.name || "").toString().trim();
    } catch (e) {
      res.writeHead(400);
      res.end(JSON.stringify({ ok: false, error: "Invalid JSON" }));
      return;
    }

    if (!name) {
      res.writeHead(400);
      res.end(JSON.stringify({ ok: false, error: "Name empty" }));
      return;
    }

    const dbDir = path.join(baseDir, "..", "db");
    const filePath = path.join(dbDir, "names.txt");

    fs.readFile(filePath, "utf8", (err, data) => {
      const players = !err && data
        ? data.split("\n").map(x => x.trim()).filter(Boolean)
        : [];

      const idx = players.indexOf(name);
      if (idx === -1) {
        res.writeHead(404);
        res.end(JSON.stringify({ ok: false, error: "Name not found" }));
        return;
      }

      players.splice(idx, 1);

      // write back file
      const toWrite = players.length ? players.join("\n") + "\n" : "";
      fs.writeFile(filePath, toWrite, (wrErr) => {
        if (wrErr) {
          res.writeHead(500);
          res.end(JSON.stringify({ ok: false, error: "Failed to update file" }));
          return;
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      });
    });
  });

  req.on("error", () => {
    res.writeHead(500);
    res.end(JSON.stringify({ ok: false, error: "Request error" }));
  });
}


