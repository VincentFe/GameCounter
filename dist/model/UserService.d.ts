import { User } from "./User.js";
/**
 * Authenticate a user with username and password.
 * @param {string} baseDir - The base directory.
 * @param {string} username - The username.
 * @param {string} password - The password.
 * @returns {Promise<User|null>} The user if authenticated, null otherwise.
 */
export declare function authenticate(baseDir: string, username: string, password: string): Promise<User | null>;
/**
 * Create a session for a user.
 * @param {User} user - The authenticated user.
 * @returns {string} Session ID.
 */
export declare function createSession(user: User): string;
/**
 * Get user from session ID.
 * @param {string} sessionId - The session ID.
 * @returns {User|null} The user if session is valid, null otherwise.
 */
export declare function getUserFromSession(sessionId: string): User | null;
/**
 * Destroy a session.
 * @param {string} sessionId - The session ID to destroy.
 */
export declare function destroySession(sessionId: string): void;
/**
 * Check if user has grandmaster permissions.
 * @param {User|null} user - The user to check.
 * @returns {boolean} True if user is grandmaster.
 */
export declare function isGrandmaster(user: User | null): boolean;
/**
 * Create a new user.
 * @param {string} baseDir - The base directory.
 * @param {string} username - The username.
 * @param {string} password - The password.
 * @param {boolean} isGrandmaster - Whether the user is a grandmaster.
 * @returns {Promise<{ ok: boolean; error?: string }>} Success status.
 */
export declare function createUser(baseDir: string, username: string, password: string, isGrandmaster?: boolean): Promise<{
    ok: boolean;
    error?: string;
}>;
/**
 * Get all users (for admin purposes).
 * @param {string} baseDir - The base directory.
 * @returns {Promise<User[]>} Array of users.
 */
export declare function getAllUsers(baseDir: string): Promise<User[]>;
//# sourceMappingURL=UserService.d.ts.map