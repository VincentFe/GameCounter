/**
 * Static File Handler
 * Serves static assets like CSS, JavaScript, images, and other files.
 */
import { IncomingMessage, ServerResponse } from "http";
/**
 * Serves static files from the public directory.
 * Determines the appropriate MIME type based on file extension.
 * @param req The HTTP request object
 * @param res The HTTP response object
 * @param baseDir The base directory path for the application
 */
export declare function serveStatic(req: IncomingMessage, res: ServerResponse, baseDir: string): void;
//# sourceMappingURL=static.d.ts.map