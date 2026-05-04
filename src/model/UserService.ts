import { User, Grandmaster } from "./User.js";
import fs from "fs/promises";
import path from "path";

// Simple session store (in production, use proper session management)
const sessions: Map<string, { user: User; expires: number }> = new Map();

let users: User[] = [];
let usersLoaded = false;

/**
 * Load users from users.json file.
 * @param {string} baseDir - The base directory.
 */
async function loadUsers(baseDir: string): Promise<void> {
  if (usersLoaded) return;

  const usersFile = path.join(baseDir, "..", "db", "users.json");
  try {
    const data = await fs.readFile(usersFile, "utf8");
    const userData = JSON.parse(data);
    users = userData.map((u: any) => {
      if (u.role === "grandmaster") {
        return new Grandmaster(u.username, u.password, u.guid);
      } else {
        return new User(u.username, u.password, u.guid);
      }
    });
  } catch (err) {
    // If file doesn't exist, create default users
    users = [
      new Grandmaster("admin", "admin123"),
      new User("user", "user123"),
    ];
    await saveUsers(baseDir);
  }
  usersLoaded = true;
}

/**
 * Save users to users.json file.
 * @param {string} baseDir - The base directory.
 */
async function saveUsers(baseDir: string): Promise<void> {
  const usersFile = path.join(baseDir, "..", "db", "users.json");
  const userData = users.map(u => ({
    guid: u.guid,
    username: u.username,
    password: u.password,
    role: u.isGrandmaster() ? "grandmaster" : "user"
  }));
  await fs.writeFile(usersFile, JSON.stringify(userData, null, 2), "utf8");
}

/**
 * Authenticate a user with username and password.
 * @param {string} baseDir - The base directory.
 * @param {string} username - The username.
 * @param {string} password - The password.
 * @returns {Promise<User|null>} The user if authenticated, null otherwise.
 */
export async function authenticate(baseDir: string, username: string, password: string): Promise<User | null> {
  await loadUsers(baseDir);
  const user = users.find(u => u.username === username);
  if (user && user.checkPassword(password)) {
    return user;
  }
  return null;
}

/**
 * Create a session for a user.
 * @param {User} user - The authenticated user.
 * @returns {string} Session ID.
 */
export function createSession(user: User): string {
  const sessionId = Math.random().toString(36).substring(2);
  const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  sessions.set(sessionId, { user, expires });
  return sessionId;
}

/**
 * Get user from session ID.
 * @param {string} sessionId - The session ID.
 * @returns {User|null} The user if session is valid, null otherwise.
 */
export function getUserFromSession(sessionId: string): User | null {
  const session = sessions.get(sessionId);
  if (session && session.expires > Date.now()) {
    return session.user;
  }
  if (session) {
    sessions.delete(sessionId); // Clean up expired session
  }
  return null;
}

/**
 * Destroy a session.
 * @param {string} sessionId - The session ID to destroy.
 */
export function destroySession(sessionId: string): void {
  sessions.delete(sessionId);
}

/**
 * Check if user has grandmaster permissions.
 * @param {User|null} user - The user to check.
 * @returns {boolean} True if user is grandmaster.
 */
export function isGrandmaster(user: User | null): boolean {
  return user ? user.isGrandmaster() : false;
}

/**
 * Create a new user.
 * @param {string} baseDir - The base directory.
 * @param {string} username - The username.
 * @param {string} password - The password.
 * @param {boolean} isGrandmaster - Whether the user is a grandmaster.
 * @returns {Promise<{ ok: boolean; error?: string }>} Success status.
 */
export async function createUser(baseDir: string, username: string, password: string, isGrandmaster: boolean = false): Promise<{ ok: boolean; error?: string }> {
  await loadUsers(baseDir);

  if (!username || !password) {
    return { ok: false, error: "Username and password required" };
  }

  if (users.some(u => u.username === username)) {
    return { ok: false, error: "Username already exists" };
  }

  const user = isGrandmaster ? new Grandmaster(username, password) : new User(username, password);
  users.push(user);
  await saveUsers(baseDir);
  return { ok: true };
}

/**
 * Get all users (for admin purposes).
 * @param {string} baseDir - The base directory.
 * @returns {Promise<User[]>} Array of users.
 */
export async function getAllUsers(baseDir: string): Promise<User[]> {
  await loadUsers(baseDir);
  return users;
}