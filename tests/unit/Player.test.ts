import Player from "../../src/model/Player.js";

describe("Player model", () => {
  test("constructs with defaults and serializes correctly", () => {
    const player = new Player("Alice");

    expect(player.name).toBe("Alice");
    expect(player.getScore()).toBe(0);
    expect(player.history).toEqual([]);
    expect(player.toJSON()).toEqual({ name: "Alice", score: 0, history: [] });
  });

  test("supports score updates and history tracking", () => {
    const player = new Player("Bob", 3);

    player.addScore(5);
    expect(player.getScore()).toBe(8);

    player.setScore(2);
    expect(player.getScore()).toBe(2);

    player.addHistory(4);
    player.addHistory(6);
    expect(player.getHistory()).toEqual([4, 6]);
  });

  test("deserializes from JSON and string data", () => {
    const original = new Player("Carol", 7, [1, 2, 3]);
    const copy = Player.fromJSON(original.toJSON());

    expect(copy.name).toBe("Carol");
    expect(copy.getScore()).toBe(7);
    expect(copy.getHistory()).toEqual([1, 2, 3]);

    const fromString = Player.fromJSON("Dave");
    expect(fromString.name).toBe("Dave");
    expect(fromString.getScore()).toBe(0);
  });
});
