/**
 * HTTP Server for GameCounter application.
 *
 * Entry point for the application that sets up an HTTP server on port 3000.
 * Implements routing for API endpoints, page routes, and static file serving.
 *
 * Request handling flow:
 * 1. API routes (GET/POST) — handled by controller functions
 * 2. Page routes (GET) — renders HTML pages
 * 3. Static files (GET) — serves CSS, JS, images from public directory
 * 4. 404 handling — returns "Not Found" for unmatched routes
 *
 * Game initialization:
 * - Calls initializeGame(__dirname) on startup to create singleton game instance
 * - Supports loading existing games via /game?game=<name> query parameter
 */
export {};
//# sourceMappingURL=server.d.ts.map