/**
 * Static File Handler
 * Serves static assets like CSS, JavaScript, images, and other files.
 */

import fs from "fs";
import path from "path";
import { IncomingMessage, ServerResponse } from "http";

/**
 * Serves static files from the public directory.
 * Determines the appropriate MIME type based on file extension.
 * @param req The HTTP request object
 * @param res The HTTP response object
 * @param baseDir The base directory path for the application
 */
export function serveStatic(
  req: IncomingMessage,
  res: ServerResponse,
  baseDir: string
): void {
  const filePath = path.join(baseDir, "..", "src", req.url || "");

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("File Not Found");
      return;
    }

    // Get file extension and determine MIME type
    const ext = path.extname(filePath).toLowerCase();

    // Map file extensions to MIME types
    const types: Record<string, string> = {
      ".html": "text/html",
      ".js": "application/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
    };

    // Send file with appropriate content type
    res.writeHead(200, {
      "Content-Type": types[ext] || "application/octet-stream",
    });
    res.end(data);
  });
}
