import { createServer } from "./app.js";

const port = 3000;

(async () => {
  try {
    const server = await createServer();
    server.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to initialize server:", err);
  }
})();
