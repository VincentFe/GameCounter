import { IncomingMessage, ServerResponse } from "http";
/**
 * Get session ID from cookies.
 * @param {IncomingMessage} req - The incoming request.
 * @returns {string|null} Session ID or null.
 */
export declare function getSessionId(req: IncomingMessage): string | null;
/**
 * Get current user from the request session.
 * @param {IncomingMessage} req - The incoming request.
 * @returns {import("../model/User.js").User|null} The current user or null.
 */
export declare function getCurrentUser(req: IncomingMessage): import("../model/User.js").User | null;
/**
 * Middleware to ensure the request is authenticated.
 * @param {IncomingMessage} req - The incoming request.
 * @param {ServerResponse} res - The response object.
 * @returns {boolean} True when authenticated.
 */
export declare function requireAuth(req: IncomingMessage, res: ServerResponse): boolean;
/**
 * Middleware to ensure the request is made by a grandmaster user.
 * @param {IncomingMessage} req - The incoming request.
 * @param {ServerResponse} res - The response object.
 * @returns {boolean} True when grandmaster.
 */
export declare function requireGrandmaster(req: IncomingMessage, res: ServerResponse): boolean;
//# sourceMappingURL=auth.d.ts.map