import * as UserService from "../model/UserService.js";
/**
 * Get session ID from cookies.
 * @param {IncomingMessage} req - The incoming request.
 * @returns {string|null} Session ID or null.
 */
export function getSessionId(req) {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader)
        return null;
    const cookies = cookieHeader.split(";").map((c) => c.trim());
    const sessionCookie = cookies.find((c) => c.startsWith("sessionId="));
    return sessionCookie ? sessionCookie.split("=")[1] : null;
}
/**
 * Get current user from the request session.
 * @param {IncomingMessage} req - The incoming request.
 * @returns {import("../model/User.js").User|null} The current user or null.
 */
export function getCurrentUser(req) {
    const sessionId = getSessionId(req);
    return sessionId ? UserService.getUserFromSession(sessionId) : null;
}
/**
 * Middleware to ensure the request is authenticated.
 * @param {IncomingMessage} req - The incoming request.
 * @param {ServerResponse} res - The response object.
 * @returns {boolean} True when authenticated.
 */
export function requireAuth(req, res) {
    const user = getCurrentUser(req);
    if (!user) {
        res.writeHead(302, { Location: "/login" });
        res.end();
        return false;
    }
    return true;
}
/**
 * Middleware to ensure the request is made by a grandmaster user.
 * @param {IncomingMessage} req - The incoming request.
 * @param {ServerResponse} res - The response object.
 * @returns {boolean} True when grandmaster.
 */
export function requireGrandmaster(req, res) {
    const user = getCurrentUser(req);
    if (!UserService.isGrandmaster(user)) {
        res.writeHead(403);
        res.end("Forbidden: Grandmaster access required");
        return false;
    }
    return true;
}
//# sourceMappingURL=auth.js.map