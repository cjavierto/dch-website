/**
 * Startup file for cPanel → Setup Node.js App ("Application startup file").
 * Passenger loads the startup file with require(), which can't load server.js
 * (an ES module with top-level await), so this CommonJS file imports it.
 */
import("./server.js").catch((err) => {
  console.error(err);
  process.exit(1);
});
