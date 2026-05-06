import fs from "fs/promises";
import os from "os";
import path from "path";

describe("UserService", () => {
  let tempRoot: string;
  let baseDir: string;
  const createModule = async () => {
    jest.resetModules();
    return await import("../../src/model/UserService.js");
  };

  beforeEach(async () => {
    tempRoot = path.join(os.tmpdir(), `user-service-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    baseDir = path.join(tempRoot, "src");
    await fs.mkdir(path.join(tempRoot, "db"), { recursive: true });
    await fs.mkdir(baseDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(tempRoot, { recursive: true, force: true });
  });

  test("creates default users and authenticates admin", async () => {
    const UserService = await createModule();
    const user = await UserService.authenticate(baseDir, "admin", "admin123");

    expect(user).not.toBeNull();
    expect(user?.username).toBe("admin");
    expect(UserService.isGrandmaster(user)).toBe(true);

    const userFile = path.join(tempRoot, "db", "users.json");
    const fileStat = await fs.stat(userFile);
    expect(fileStat.isFile()).toBe(true);
  });

  test("rejects duplicate usernames and requires credentials", async () => {
    const UserService = await createModule();

    const initialResult = await UserService.createUser(baseDir, "tester", "pass", false);
    expect(initialResult.ok).toBe(true);

    const duplicateResult = await UserService.createUser(baseDir, "tester", "pass2", false);
    expect(duplicateResult.ok).toBe(false);
    expect(duplicateResult.error).toBe("Username already exists");

    const missingResult = await UserService.createUser(baseDir, "", "", false);
    expect(missingResult.ok).toBe(false);
    expect(missingResult.error).toBe("Username and password required");
  });

  test("creates a session and destroys it correctly", async () => {
    const UserService = await createModule();
    const createResult = await UserService.createUser(baseDir, "session-user", "secret", false);
    expect(createResult.ok).toBe(true);

    const user = await UserService.authenticate(baseDir, "session-user", "secret");
    expect(user).not.toBeNull();
    expect(user?.username).toBe("session-user");

    const sessionId = UserService.createSession(user!);
    expect(sessionId).toBeDefined();
    expect(UserService.getUserFromSession(sessionId)?.username).toBe("session-user");

    UserService.destroySession(sessionId);
    expect(UserService.getUserFromSession(sessionId)).toBeNull();
    expect(UserService.isGrandmaster(user)).toBe(false);
  });
});
