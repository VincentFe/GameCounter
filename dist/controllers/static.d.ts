import { IncomingMessage, ServerResponse } from "http";
/**
 * Serve static files (HTML, CSS, JS, images, etc.) from the public directory.
 * Maps file extensions to appropriate MIME types.
 * @param {IncomingMessage} req - HTTP request object containing the file path in req.url.
 * @param {ServerResponse} res - HTTP response object.
 * @param {string} baseDir - The base directory (__dirname or equivalent).
 * @returns {void}
 */
export declare function serveStatic(req: IncomingMessage, res: ServerResponse, baseDir: string): void;
//# sourceMappingURL=static.d.ts.map