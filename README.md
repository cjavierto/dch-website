# Handoff: Deiparine Community Hospital — Public Website + Admin Portal

## Overview
A public website for **Deiparine Community Hospital (DCH)**, a DOH-licensed, PhilHealth-accredited community hospital in Poblacion, Sibonga, Cebu, Philippines — plus an **admin portal (CMS)** where hospital staff manage all website content and read form submissions.

Audience: patients and families in southern Cebu, often on mobile, often on slow connections. Priorities: emergency number always visible, plain language, fast pages.

## About the design files
Everything in `designs/` is a **design reference built in HTML** — a prototype showing intended look, content and behaviour. It is **not production code to ship**. Recreate these designs in a real stack.

No codebase exists yet. Recommended stack (adjust if the team prefers otherwise):
- **Next.js (App Router) + TypeScript + Tailwind CSS** for the public site — server-rendered for SEO and speed.
- **Payload CMS** (or Strapi / Sanity) for the admin portal — it gives CRUD, auth, media library, drafts and roles out of the box. The admin designs show the **content model and screens to build**; using the CMS's admin UI with DCH theming is acceptable, a fully custom admin is optional.
- **PostgreSQL** database; image storage on S3-compatible storage.
- Map Tailwind's theme to the tokens in `design-system/tokens/*.css` — do not invent new colours or sizes.

To view a design: open the `.dc.html` file in a browser (they load `support.js` from the same folder). Navigation inside each prototype is clickable.

## Fidelity
**High-fidelity.** Colours, type, spacing, radii, copy and interactions are final. Recreate pixel-accurately. Where the prototype and `design-system/DESIGN-SYSTEM.md` disagree, **the prototype wins**.

---

## Files
| Path | What it is |
|---|---|
| `designs/DCH Hospital Website.dc.html` | Desktop website — all public pages (ground truth) |
| `designs/DCH Hospital Website - Mobile.dc.html` | Mobile versions of every page, shown in phone frames |
| `designs/DCH Admin Portal.dc.html` | Admin portal — every CMS screen |
| `designs/assets/` | Logo and real hospital photography |
| `design-system/DESIGN-SYSTEM.md` | Brand voice, colour, type, spacing, component rules — **read this first** |
| `design-system/tokens/*.css` | CSS custom properties: colours, typography, spacing, elevation, motion, fonts |
| `design-system/styles.css` | Entry stylesheet importing all tokens |

In the `.dc.html` files, markup is inside `<x-dc>…</x-dc>` with inline styles (exact values). Content data (doctors, services, news, FAQs, etc.) lives in the `<script>` class at the bottom of each file as JS arrays — use it as seed data.

---

## Design tokens (summary — full set in `design-system/tokens/`)

**Colour**
- Navy 900 `#0e2559` — utility bar, page heroes, footer, primary hover
- Navy 700 `#14357f` — primary buttons, links, icons, selected states
- Green 600 `#2f8b3c` — eyebrows, checkmarks, specialty labels, link hover
- Gold 500 `#e8b23a` — single most important CTA on a page, footer headings, on-navy accents
- Red 700 `#8f1d1d` — **emergency only** (ER cards, hotline). Never decorative.
- Paper `#f7f6f2` (page background) · White `#ffffff` (cards)
- Ink `#14181f` (text) → `#4a4741` (body secondary) → `#6d6a62` → `#8a8578` (meta) → `#b3aea1` (disabled)
- Borders: card hairline `#e6e3da` · field border `#ddd9cf` · divider `#eeece5`
- Tints: info `#f2f4fa` · success `#eef7f0` (ink `#22432c`) · muted `#f4f2ec`
- On-navy text: `#cfd9ee` (body) · `#9fb2dc` (meta)

**Type** — Google Fonts
- **Source Serif 4** 700 — all headings and large figures. H1 hero 56px/−1px; page H1 44px/−0.8px; section H2 32–34px/−0.5px; card H2 24px.
- **Source Sans 3** 400/500/600/700 — body and UI. Body 16/1.7 (max ~70ch); card copy 14.5–15/1.6; labels 13.5px 600; meta 12.5–13px.
- Eyebrow: 12px, 700, uppercase, letter-spacing 1.4px, green.
- Minimums: 12px desktop; 15px mobile body.

**Icons** — Google **Material Symbols Outlined** (rendered with class `ms`). Sizes 17–30px. Icon names are in the markup (e.g. `event_available`, `stethoscope`, `call`).

**Layout & spacing**
- Content max width 1240px; gutters 24px (16px mobile).
- Grids: `repeat(auto-fit, minmax(280–320px, 1fr))` so they wrap rather than squeeze.
- Card padding 24–28px (18px mobile); grid gap 18–24px; sections 56–72px apart.
- Radii: tag 6 · input 9 · button 10 · card 14–16 · panel 18 · pill 999.
- Shadows: rare — only dropdown menus/drawers and cards overlapping a hero.

**States** — hover is colour-only (no lift/scale): links navy→green; cards swap hairline to navy; primary buttons darken to navy 900; gold lightens. Transitions 120–180ms. Add a visible navy focus ring (2px `#14357f`, 2px offset) for keyboard users.

**Responsive** — mobile-first. Desktop nav collapses to a hamburger drawer below ~960px. See the mobile file for exact mobile layouts.

---

## Public website — sitemap & screens

### Global chrome (every page)
1. **Utility bar** (navy 900): 24/7 ER hotline (red/gold emphasis), trunkline, then right-aligned **Careers** and **Contact** links.
2. **Main header** (white): DCH logo left, vertically centred; primary nav; gold **Book Appointment** button (→ Contact, see below).
3. **Primary nav**: Home · About DCH ▾ (About, Vision & Values, Staff & Leadership Team) · Services ▾ (mega-menu of departments) · Patients & Visitors · Doctors Directory · News · Health Information.
4. **Footer** (navy 900): logo + address, link columns (gold headings), contact column, **accreditation strip** (PhilHealth + DOH logo badges on white plates, accreditation number), legal line.

### Pages
| Page | Key content |
|---|---|
| **Home** | Photo hero with navy scrim + headline + CTAs; quick-action cards (Book Appointment → Contact, Doctors Schedule → Doctors Directory, Patients & Visitors, ER); services grid; stats strip (toggleable); facility section; **FAQ accordion** (6 items, first open); Medical Director spotlight (Dr. James Deiparine); latest news |
| **About DCH** | History, facility facts, photos |
| **Vision & Values** | Vision, mission, value cards |
| **Staff & Leadership Team** | Hospital leadership and department heads — **separate data from doctors** |
| **Services** (index) | All departments as cards |
| **Service detail** | One template for every department: hero, what we offer, conditions/procedures, schedule, related doctors, CTA |
| **Patients & Visitors** | "What to bring" (4 grouped checklists, full width) · "What happens on the day" (5 steps) · sidebar: visiting hours, help desk numbers, "How billing works" (prose, no rate table) |
| **Doctors Directory** | Filterable list: photo thumbnail, name, specialty, **Mon–Sat availability chips**, clinic hours. **No email or phone.** |
| **News & Announcements** | List with category tags; **News detail** template |
| **Health Information** | Blog-style article list; article template ends with medical disclaimer + ER number |
| **Careers** | Job listings; **Career detail** with requirements and how to apply |
| **Contact** | "Send us a message" form (name, mobile, optional email, subject select defaulting to "Appointment request", message) + map, address, hotline card |

### Booking — parked for post-launch
`designs/DCH Hospital Website.dc.html` contains a **complete "Book an appointment" page** (`isBooking`) that is **not linked** anywhere. For launch: **every "Book Appointment" CTA routes to `/contact`** with the subject preset to "Appointment request". Build the route but keep it disabled/feature-flagged.

When booking is enabled later, the flow is a 4-step progressive picker (each step appears after the previous is chosen):
1. Department (cards with doctor count)
2. Doctor (only that department's doctors, with weekly availability chips + hours)
3. Date (month calendar; only that doctor's clinic weekdays in the future are selectable)
4. Time (20-minute slots from the doctor's clinic hours; taken slots struck through; lunch 12–1 skipped on all-day clinics)
Then patient details + summary with "Change" link; submits a **request** (staff confirm by SMS), not a confirmed booking.

---

## Admin portal — screens
Left sidebar nav grouped Overview / Content / Inbox / Library / Settings; top bar with breadcrumb, page heading and a primary action.

| Screen | Primary action | Notes |
|---|---|---|
| Dashboard | New announcement | Counts, recent submissions, recent edits |
| Pages | New page | Services, About, Vision & Values, Patients & Visitors etc.; list + **Page editor** (title, slug, hero image, rich body, SEO, status) |
| News & Announcements | New announcement | List + **editor** (title, category, cover, body, publish date, pinned, status) |
| Health Information | New article | Same editor pattern as News |
| Doctors directory | Add doctor | List + **Doctor editor** (photo, name, specialty, department, weekly schedule per day + hours, active) |
| Booking entries | Add walk-in | **Hide until booking launches** |
| Contact us entries | Export CSV | Inbox: read/unread, subject filter, status (new / replied / closed), notes |
| Careers | New posting | List + **Job editor** (title, department, type, description, requirements, closing date, status) |
| Media library | Upload photos | Grid, alt text required |
| Website settings | Save settings | Hospital name, address, trunkline, **emergency number**, email, hours, social links, accreditation numbers, visiting hours, footer text |

Settings values must feed the public site globally (header, footer, contact page) — no hard-coded phone numbers.

---

## Content model (suggested)
- **Page** — title, slug, template (generic / service), hero image, body blocks, SEO, status
- **Service** — name, slug, icon, summary, body, schedule, related doctors
- **Doctor** — name, photo, specialty, department → Service, schedule `[{day: Mon–Sat, from, to}]`, active, sort
- **StaffMember** — name, photo, title, group (leadership / department head), bio, sort  *(distinct from Doctor)*
- **NewsPost** — title, slug, category, cover, excerpt, body, publishedAt, pinned, status
- **Article** (Health Information) — title, slug, category, cover, excerpt, body, author, publishedAt, status
- **JobPosting** — title, slug, department, employment type, description, requirements, closesAt, status
- **ContactSubmission** — name, mobile, email?, subject, message, status, internal notes, createdAt
- **FAQ** — question, answer, sort
- **SiteSettings** (singleton) — all fields listed under Website settings
- **BookingRequest** — *later*

## Interactions & behaviour
- Dropdown menus open on hover/click on desktop; drawer on mobile; close on outside click/Escape.
- FAQ: single-open accordion, `+`/`−` icon, open item gets navy border.
- Doctors Directory: filter by department/specialty and by day.
- Forms: required fields name, mobile, message; PH mobile validation (`09XX XXX XXXX` / `+63`); show inline errors; success state "We'll reply within one working day". Spam protection (honeypot or Turnstile). Submissions save to CMS and email the hospital inbox.
- Every form shows "Not for emergencies. For urgent cases call (032) 484 1234."
- Health pages end with a disclaimer + ER number.

## Assets
- `assets/dch-logo.jpg` — official logo (user-supplied). Request a vector/SVG version from the hospital.
- `assets/*.png` — hospital photography cropped from user-supplied images; `dr-james-deiparine.png` is the Medical Director's portrait.
- Some doctor photos in the prototype are placeholders or initials — replace with real portraits.
- **PhilHealth and DOH logos** are empty slots in the footer — obtain official files from the hospital.

## Open items to confirm with the hospital
- Real phone numbers, accreditation number and validity, address details (prototype values are placeholders)
- Real doctor roster and schedules; staff/leadership list
- Whether a Bisaya language version is planned (the prototype shows a switcher; remove if not)
- Domain, hosting, and who owns the admin accounts / roles
