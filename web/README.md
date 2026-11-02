# DCH public website + admin

Next.js 16 (App Router, Cache Components) + TypeScript + Tailwind CSS v4, with
Payload CMS 3 (admin at `/admin`) on a SQLite database file.
Design reference: `../designs/` · design system: `../design-system/` · handoff: `../README.md`.

```bash
npm install
cp .env.example .env        # then fill PAYLOAD_SECRET and SEED_ADMIN_PASSWORD
npm run payload migrate     # creates data/dch.db
npm run seed                # imports src/content/* + images, creates the first admin user
npm run dev                 # site http://localhost:3000 · admin http://localhost:3000/admin
npm run build
npm run lint
```

`SEED_FORCE=1 npm run seed` replaces all CMS content with the seed again (inbox entries and users are kept).

## Where things live

| Path | What |
|---|---|
| `src/app/(site)/` | Public site. `layout.tsx` is its root layout. |
| `src/app/(payload)/` | Payload admin (`/admin`) and REST API (`/api`), with their own root layout. `custom.scss` themes the admin with the DCH tokens. |
| `src/payload.config.ts` | Payload config: collections, globals, SQLite adapter. |
| `src/payload/` | Collections (`collections/`), page/settings globals (`globals/`), shared fields, rich text ↔ `Block` conversion (`richText.ts`), cache revalidation hooks (`revalidate.ts`). |
| `src/migrations/` | Database migrations (generated). |
| `src/seed.ts` | Imports `src/content/*` into Payload. |
| `src/app/globals.css` | Tailwind theme mapped to the design tokens. The default Tailwind palette is disabled — only DCH colours exist. Breakpoint `nav:` = 960px (desktop nav vs. drawer). |
| `src/styles/tokens/` | Copies of `../design-system/tokens/*.css` (fonts come from `next/font` instead of `fonts.css`). |
| `src/lib/cms.ts` | **The only way components get content.** Payload Local API queries, cached with `"use cache"` + `cacheTag`; Payload hooks call `revalidateTag` so admin edits show on the next visit. |
| `src/content/` | Seed content from the prototype, imported by `npm run seed`. `{emergencyNumber}` / `{trunkline}` in CMS text are filled from Website settings. |
| `src/lib/routes.ts` | Every public href. "Book Appointment" → `/contact?subject=appointment` while booking is parked. |
| `src/components/Icon.tsx` | Material Symbols Rounded, subset to `ICON_NAMES` — add a name there before using a new icon. |
| `src/components/layout/` | Utility bar, sticky header, desktop nav + mega-menus, mobile drawer, mobile Call ER / Book bar, footer. |
| `src/components/home/` | Homepage sections. |
| `src/components/ui/` | Shared pieces: section heading, panels, tags, filter chips, avatars, form fields, rich text, health disclaimer. |
| `src/app/(site)/*/[slug]/` | Detail templates (service, news, health article, job). Content renders inside `<Suspense>` so client navigation is instant; every slug is prerendered via `generateStaticParams`. |

Phone numbers, address, accreditation and footer text come from `getSiteSettings()` — never hard-code them.

## Working copy in iCloud

The project currently lives in `~/Documents`, which is synced to iCloud Drive. iCloud can offload files to the cloud (builds then hang) and creates "file 2" conflict copies. The `DCH` folder is set to **Keep Downloaded**; moving the project out of iCloud (e.g. `~/Projects/DCH`) is still recommended, especially for `data/dch.db`. Database backups made before migrations go in `../backups/`.

## CMS notes

- **Admin sections** follow the admin-portal design: Content (pages, services, news, health info, doctors, staff, careers, FAQs), Inbox (contact entries, job applications, applicant CVs), Library (media), Settings (website settings, homepage, admin users). Booking entries are hidden until booking launches.
- **Rich text** offers only what `components/ui/RichText` renders: paragraphs, H2, bulleted lists, a "Lead paragraph" block and a "Pull quote" block.
- **News, health articles and job postings** have drafts; only published items show. Job postings with a past closing date are hidden.
- **Submissions**: the contact form creates *Contact us entries*; job applications create *Job applications* with the CV in *Applicant CVs* (private — not in the public media library).
- **Email is not sent yet** (TODO in `src/payload.config.ts` and `src/lib/cms.ts`): add an SMTP adapter once the hospital's mail settings exist.
- **Schema changes** go through migrations (dev push is off so the SQLite file always matches production): edit a collection, then `npm run payload migrate:create <name>` and `npm run payload migrate`.

## Online booking (switched off for launch)

`/book` is the 4-step appointment picker (department → doctor → date → 20-minute slot → details). It saves a *request* to Inbox → Booking entries for OPD staff to confirm by SMS. Only doctors with **Online booking** start/end times set (Content → Doctors directory) can be booked; requested and confirmed slots show as taken.

It is controlled by `NEXT_PUBLIC_BOOKING_ENABLED` (see `src/lib/features.ts`):

- **Off (default):** `/book` is a 404, every "Book Appointment" button goes to `/contact?subject=appointment`, and Booking entries are hidden in the admin.
- **On:** set the GitHub repository variable `BOOKING_ENABLED` to `true` and deploy — it is baked in at build time, so setting it only in cPanel does nothing. (Manual builds: `NEXT_PUBLIC_BOOKING_ENABLED=true npm run package:namecheap`.) Locally, the `web-booking` entry in `.claude/launch.json` runs the dev server with it on.

## Deploying to Namecheap shared hosting (via Git)

The site runs as a Node.js app under cPanel → **Setup Node.js App** (Phusion Passenger) with `server.js` as the startup file, in `~/dch-web` (outside `public_html`). There is no database server: content lives in `data/dch.db`, uploads in `media/` and `uploads/`, all inside the app folder and **never in Git** — a deploy can't overwrite what staff edit.

**How a deploy works**

1. Push to `main` on GitHub (`cjavierto/dch-website`).
2. GitHub Actions (`.github/workflows/deploy-branch.yml`) installs, lints and **builds** the site — shared hosting doesn't have the memory to build Next.js — then publishes the ready-to-run files to the **`deploy`** branch (one commit, replaced on each build).
3. In cPanel → **Git Version Control** → Manage → *Pull or Deploy*: **Update from Remote**, then **Deploy HEAD Commit**. That runs `deploy.sh` (from `deploy/cpanel/`, via `.cpanel.yml`), which copies the files into `~/dch-web`, runs `npm install` if dependencies changed, restarts the app, and calls `/deploy-hook` so pages render from the live database instead of the build's starter data. Log: `~/dch-deploy.log`.

Pending database migrations run when the app starts.

**Repository variables** (GitHub → Settings → Secrets and variables → Actions → Variables): `SITE_URL` (required to publish, e.g. `https://www.example.com`), `APP_DIR` (default `/home/deipmali/dch-web`), `BOOKING_ENABLED` (`true` turns on online booking).

**One-time setup**

1. cPanel → **Setup Node.js App** → Create application: Node.js **20.9 or newer** · mode Production · application root `dch-web` · your domain · startup file `server.js`. Environment variables: `NODE_ENV=production`, `DATABASE_URL=file:./data/dch.db`, `PAYLOAD_SECRET` (new long random value), `NEXT_PUBLIC_SERVER_URL=https://your-domain`.
2. Upload the starting content once: `data/`, `media/` and `uploads/` from this folder into `~/dch-web` (File Manager → upload a zip → Extract).
3. Give cPanel read access to the private repo: cPanel → **SSH Access** → Manage SSH Keys → Generate a key **without a passphrase**; add its public key on GitHub → repo Settings → **Deploy keys** (read-only). cPanel's Git docs also need `~/.ssh/config` pointing `github.com` at that key.
4. cPanel → **Git Version Control** → Create: Clone URL `git@github.com:cjavierto/dch-website.git`, path `repositories/dch-website`. Then Manage → switch the checked-out branch to **`deploy`** → Update from Remote → Deploy HEAD Commit.
5. In the Node.js app: **Run NPM Install** (first time only — later deploys install automatically when dependencies change), then Restart. Sign in at `/admin` and replace the seeded admin account.

**Manual fallback** (no Git): `npm run package:namecheap` builds a zip locally; extract it over `~/dch-web` and restart.

**Backups:** `data/dch.db`, `media/` and `uploads/` are the whole site's content. Make sure cPanel backups include the app folder, or download them regularly. To look at the raw data, open `dch.db` in [DB Browser for SQLite](https://sqlitebrowser.org) (phpMyAdmin is MySQL-only).

Shared-hosting caveats: memory and process limits are tight. If the app restarts often or runs out of memory, ask Namecheap to raise the account's limits, or move to a small VPS.

## Not connected yet

- **Unwritten content**: only the Imaging & Radiology department, the CT-scanner announcement and the ER staff-nurse posting have full copy in the prototype. Other detail pages show their summary and a "being prepared" note.
- **Privacy notice and Patient rights** (`/privacy`, `/patient-rights`) carry draft copy written for the site (no prototype copy existed). Have the Data Protection Officer and management review it in the admin under Settings → Privacy & patient rights before launch.
- Unknown slugs on detail routes return a soft 404 (`noindex`, HTTP 200) because their content streams; `dynamicParams` is unavailable with Cache Components.
