import fs from "fs/promises";
import os from "os";
import path from "path";
import Player from "../../src/model/Player.js";
import { Quiz, ChineesPoepeke } from "../../src/model/Game.js";

describe("Game model", () => {
  const tempRoot = path.join(os.tmpdir(), `game-model-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const baseDir = path.join(tempRoot, "src");
  const dbDir = path.join(tempRoot, "db");

  beforeAll(async () => {
    await fs.mkdir(dbDir, { recursive: true });
    await fs.mkdir(baseDir, { recursive: true });
  });

  afterAll(async () => {
    await fs.rm(tempRoot, { recursive: true, force: true });
  });

  test("Quiz game serializes and preserves players", async () => {
    const quiz = new Quiz([new Player("Alice", 5)], "My Quiz", true, "secret", undefined, "gm-guid");

    expect(quiz.getGameType()).toBe("quiz");
    expect(quiz.getGameName()).toBe("My Quiz");
    expect(quiz.getGrandmasterId()).toBe("gm-guid");

    const json = quiz.toJSON();
    expect(json.gameType).toBe("quiz");
    expect(json.name).toBe("My Quiz");
    expect(json.players).toEqual([{ name: "Alice", score: 5, history: [] }]);

    await quiz.saveToFile(baseDir);
    const fileContents = await fs.readFile(path.join(dbDir, "My Quiz.json"), "utf8");
    const parsed = JSON.parse(fileContents);
    expect(parsed.gameType).toBe("quiz");
    expect(parsed.name).toBe("My Quiz");
  });

  test("Chinees Poepeke updates and persists round data", async () => {
    const game = new ChineesPoepeke([new Player("Bob", 2)], "CP Test", true, "", undefined, 3);

    expect(game.getGameType()).toBe("chinees poepeke");
    expect(game.getRound()).toBe(3);

    game.setRound(5);
    expect(game.getRound()).toBe(5);

    const json = game.toJSON();
    expect(json.gameType).toBe("chinees poepeke");
    expect(json.round).toBe(5);

    await game.saveToFile(baseDir);
    const fileContents = await fs.readFile(path.join(dbDir, "CP Test.json"), "utf8");
    const parsed = JSON.parse(fileContents);
    expect(parsed.gameType).toBe("chinees poepeke");
    expect(parsed.round).toBe(5);
  });
});
