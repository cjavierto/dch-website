/**
 * Startup file for Namecheap's cPanel "Setup Node.js App" (Phusion Passenger).
 * Passenger starts this file and routes the domain's traffic to it; the port
 * it passes in PORT is ignored by Passenger's own listener, so any value works.
 * Locally, use `npm run dev` / `npm start` instead.
 */
import { createServer } from "node:http";
import next from "next";

const port = Number(process.env.PORT) || 3000;
const app = next({ dev: false, dir: import.meta.dirname });
const handle = app.getRequestHandler();

await app.prepare();
createServer((req, res) => handle(req, res)).listen(port, () => {
  console.log(`DCH website ready on port ${port}`);
});
