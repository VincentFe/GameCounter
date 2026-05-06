import path from "path";
import fs from "fs/promises";
import request from "supertest";
import { createServer } from "../../src/app.js";
import { resetGame } from "../../src/model/gameManager.js";

const projectRoot = path.resolve(process.cwd());
const dbDir = path.join(projectRoot, "db");
const usersFile = path.join(dbDir, "users.json");

let originalUsersFileData: string | null = null;
let usersFileExisted = false;

async function restoreUsersFile(): Promise<void> {
  if (usersFileExisted) {
    await fs.writeFile(usersFile, originalUsersFileData ?? "", "utf8");
  } else {
    try {
      await fs.unlink(usersFile);
    } catch {
      // ignore if file does not exist
    }
  }
}

describe("GameCounter integration tests", () => {
  let server: any;
  let agent: request.SuperTest<request.Test>;

  beforeAll(async () => {
    try {
      await fs.access(usersFile);
      usersFileExisted = true;
      originalUsersFileData = await fs.readFile(usersFile, "utf8");
    } catch {
      usersFileExisted = false;
      originalUsersFileData = null;
    }
  });

  beforeEach(async () => {
    resetGame();
    server = await createServer();
    await new Promise<void>((resolve, reject) => {
      server.listen(0, (err: Error | undefined) => {
        if (err) reject(err);
        else resolve();
      });
    });
    agent = request.agent(server);
  });

  afterEach(async () => {
    if (server && typeof server.close === "function") {
      await new Promise<void>((resolve, reject) => {
        server.close((err: Error | undefined) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  });

  afterAll(async () => {
    await restoreUsersFile();
  });

  test("GET /login returns HTML login page", async () => {
    const response = await request(server).get("/login");
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/html/);
    expect(response.text).toContain("Login");
  });

  test("POST /login with valid credentials returns redirect and session cookie", async () => {
    const response = await agent
      .post("/login")
      .type("form")
      .send({ username: "admin", password: "admin123" });

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/");
    expect(response.headers["set-cookie"]).toBeDefined();
  });

  test("Unauthenticated request to protected endpoint redirects to login", async () => {
    const response = await request(server).get("/playerNames");
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/login");
  });

  test("Authenticated grandmaster can add a player and retrieve player names", async () => {
    await agent.post("/login").type("form").send({ username: "admin", password: "admin123" });
    const addResponse = await agent
      .post("/saveName")
      .send({ name: "Integration Player" })
      .set("Content-Type", "application/json");

    expect(addResponse.status).toBe(200);
    expect(addResponse.body).toEqual({ ok: true });

    const namesResponse = await agent.get("/playerNames");
    expect(namesResponse.status).toBe(200);
    expect(namesResponse.body).toContain("Integration Player");
  });

  test("Authenticated grandmaster can change game type and round", async () => {
    await agent.post("/login").type("form").send({ username: "admin", password: "admin123" });

    const typeResponse = await agent
      .post("/setGameType")
      .send({ type: "quiz" })
      .set("Content-Type", "application/json");
    expect(typeResponse.status).toBe(200);
    expect(typeResponse.body).toEqual({ ok: true });

    const roundResponse = await agent
      .post("/setRound")
      .send({ round: 2 })
      .set("Content-Type", "application/json");
    expect(roundResponse.status).toBe(200);
    expect(roundResponse.body).toEqual({ ok: true });
  });

  test("Authenticated grandmaster can save a game and list saved games", async () => {
    const uniqueGameName = `integration-game-${Date.now()}`;
    await agent.post("/login").type("form").send({ username: "admin", password: "admin123" });

    const nameResponse = await agent
      .post("/setGameName")
      .send({ name: uniqueGameName })
      .set("Content-Type", "application/json");
    expect(nameResponse.status).toBe(200);
    expect(nameResponse.body).toEqual({ ok: true });

    const saveResponse = await agent.post("/saveGame");
    expect(saveResponse.status).toBe(200);
    expect(saveResponse.body).toEqual({ ok: true });

    const listResponse = await agent.get("/listGames");
    expect(listResponse.status).toBe(200);
    expect(Array.isArray(listResponse.body)).toBe(true);
    expect(listResponse.body).toContain(uniqueGameName);

    await fs.unlink(path.join(dbDir, `${uniqueGameName}.json`));
  });
});
