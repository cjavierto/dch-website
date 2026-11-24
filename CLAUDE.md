# DCH website — notes for Claude

Website for Deiparine Community Hospital (Sibonga, Cebu). Next.js 16 (App Router, Cache Components) + Payload CMS 3 + SQLite, in `web/`.

- Staging: https://staging.deiparinecommunityhospital.ph (noindex). The main domain still shows a coming-soon page.
- Hosting: Namecheap shared hosting, cPanel "Setup Node.js App" (Phusion Passenger), app folder `~/dch-web`, Node 22, startup file `server.cjs`, database `~/dch-web/data/dch.db`.
- Staff edit all content in the Payload admin at `/admin`; the owner runs every cPanel step themselves.

## Deploying

1. Push to `main`.
2. GitHub Actions (`.github/workflows/deploy-branch.yml`) builds against a throwaway seeded database and publishes the result to the `deploy` branch (~2 min). The server never builds: shared hosting lacks the memory.
3. cPanel → Git Version Control → **Update from Remote** → **Deploy HEAD Commit**, which runs `web/deploy/cpanel/deploy.sh`: copies files, runs `npm install` if the lockfile changed, restarts the app, and expires the build-time page snapshots. Log: `~/dch-deploy.log` (ends with `== done`). App errors: `~/dch-web/stderr.log`.

Migrations run on start-up (`prodMigrations`). Deploys never touch `data/`, `media/` or uploads.

## Codebase map (`web/`)

| Path | Role |
| --- | --- |
| `src/payload.config.ts` | Payload config; collections wrapped with `withAudit()`, globals with `withAuditGlobals()` (`src/payload/audit.ts`, the Activity log) |
| `src/payload/collections/`, `src/payload/globals/index.ts` | Admin schema. Doctors in `People.ts`; inbox and appointments (`booking-requests`) in `Inbox.ts` |
| `src/lib/cms.ts` | The only way the public site reads content: `"use cache"` + `cacheTag`, mapped to `src/lib/types.ts` |
| `src/payload/revalidate.ts`, `src/lib/cacheTags.ts`, `server.js` | Cache expiry on admin edits, shared across Passenger processes through `cache-tags.json` beside the database |
| `src/app/(site)/` | Public pages; `book-appointment/` is the self-service booking page (`src/lib/appointments*.ts`, `appointmentEmails.ts`) |
| `src/app/(payload)/` | Payload admin and REST API |
| `src/lib/notify.ts`, `src/payload/postmark.ts` | Email through Postmark's HTTPS API (`POSTMARK_SERVER_TOKEN`; without it, emails are logged) |
| `src/content/`, `src/seed.ts` | Starter content, used only to seed a fresh database (CI build, local) |
| `src/migrations/` | Database migrations |

## Rules

- **Schema changes need a migration:** `npm run payload -- migrate:create <name>`. It waits on interactive prompts, so pipe carriage returns into it. Read the generated SQL: only additive changes are safe for the live content. Then `npm run generate:types`.
- **Data migrations use raw SQL**, never the Payload Local API: the config keeps changing and old migrations would break.
- **Keep `next.config.mjs` plain JavaScript.** The server's GLIBC is older than 2.29, so Next.js's native SWC can't load there. A `.ts` config needs SWC at start-up and took the site down with a 503. Before any Next.js upgrade, start the production build (`node server.cjs`) with `node_modules/@next/swc-*` hidden to mimic the server.
- **Admin routes render per request** (`await connection()` in `src/app/(payload)/layout.tsx` and the admin page). Without it, logging in needs a refresh.
- **Cache:** a new cached read in `cms.ts` needs a `cacheTag`, and the collection or global needs a matching expiry hook (`revalidateCollection` / `revalidateGlobal`). Always expire tags through `expireTags()` so every process sees it.
- **Optional admin fields keep a built-in default** when empty (e.g. `HERO_*`, `VALUES_*` in `src/payload/globals/index.ts`), so new fields don't change the live site until staff edit them.
- **Testing:** verify on a production build (`npm run build`, then `node server.cjs`) with a copy of `data/dch.db`, not the real one. Payload ignores cookie auth on requests with neither `Origin` nor `Sec-Fetch-Site`; add `Sec-Fetch-Site: same-origin` when testing with curl.
- **Credentials:** never print or paste them. The local test admin login is `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` in `web/.env`; read it into commands, never echo it.
- **Git:** commit and push only when the owner asks; commit only the files you changed. `dch-coming-soon.zip` and `under-construction/` are the owner's files, not part of the site.
- **The Mac checkout sits in iCloud-synced Documents.** iCloud evicts files and makes duplicates such as `.git/refs/heads/main 2` or `.next/types/routes.d 3.ts` that break git and builds. Check duplicate refs point at an ancestor of `main` before deleting them; `.next` can always be deleted.

## Open items (Nov 2026)

- Confirm staging is back up after deploying `e8eec14` (the 503 fix).
- Tick "Accept online appointments" on bookable doctors, test a booking email, then point the "Book Appointment" buttons (`routes.book` in `src/lib/routes.ts`) at `/book-appointment`. The old `/book` page and `NEXT_PUBLIC_BOOKING_ENABLED` flag can then go.
- Not built yet: doctor email notices on bookings, day-before reminders (needs a cPanel cron job).
- Update Payload CMS (npm flags 3.91 packages, some high), as its own change with full testing.
- Placeholder phone, PhilHealth and email values in Website settings.
- At launch: change the `SITE_URL` repository variable and `NEXT_PUBLIC_SERVER_URL` to the real domain.

Full history of the Nov 2026 work: `DCH-session-summary.md` (local copy, not in git).
