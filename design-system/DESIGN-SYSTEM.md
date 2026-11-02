# Deiparine Community Hospital — Design System

A design system for **Deiparine Community Hospital (DCH)**, a DOH-licensed,
PhilHealth-accredited community hospital on the national highway in Poblacion,
Sibonga, Cebu, Philippines. It serves Sibonga and the neighbouring southern-Cebu
towns with a 24-hour emergency room, maternity and delivery services, two
operating rooms, and a diagnostic complex (digital X-ray, ultrasound, ECG,
16-slice CT, clinical laboratory).

## Sources this system was built from

| Source | What it gave us |
| --- | --- |
| `uploads/images.jpg` (user-supplied logo) | The circular DCH mark — copied to `assets/dch-logo.jpg`, used unmodified |
| `uploads/Gemini_Generated_Image_*.jpg` (user-supplied photo sheets) | Facility and staff photography, cropped into `assets/*.png` |
| `uploads/Untitled-design-1-7.png` | Portrait of Dr. James Deiparine, Medical Director |
| `DCH Hospital Website.dc.html` (project root) | The approved desktop website — **the ground truth for every token and component here** |
| `DCH Hospital Website — Mobile.dc.html` (project root) | The approved mobile mockup — source of the mobile scale and patterns |

No codebase, Figma file, or prior brand manual was supplied. Everything in this
system was extracted from the two approved mockups above; where a value was
ambiguous, the mockup's literal value wins.

**Substitutions to confirm** — see "Open questions" at the end.

---

## Content fundamentals

The voice is a **competent neighbour**, not a corporate health brand.

- **Person.** Address the reader as *you*; the hospital is *we*. "Bring a valid
  ID of patient and companion", not "Patients are required to present…".
- **Casing.** Sentence case everywhere, including buttons ("Book an appointment").
  Uppercase is reserved for eyebrows, tags, and column headings.
- **Sentence length.** Short and factual. Headlines are a single clause with a
  full stop: "Compassionate care, close to home."
- **Specifics over adjectives.** "Two operating rooms", "60 licensed beds",
  "results in 24h", "(032) 484 1200 local 112" — never "world-class",
  "state-of-the-art", or "patient-centric".
- **Local reality is in the copy.** PhilHealth, HMO letters of authorization,
  senior/PWD booklets, MDR, barangay transfers, Cebuano/Bisaya, peso amounts
  with ₱ and thousands separators.
- **Time and dates.** "Mon–Sat · 8:00 AM – 5:00 PM", "Tue & Fri · 1–5 PM",
  "8 AM – 12 NN" (NN for noon — a Philippine convention worth keeping).
- **Safety first, always.** Any page that gives health guidance ends with a
  disclaimer and the ER number. Booking forms say "Not for emergencies."
- **Numbers are honest.** Placeholder figures are labelled as such
  ("Sample rates for mockup purposes"). Never invent a statistic.
- **No emoji, ever.** No exclamation marks. No hospital jargon without a plain
  gloss ("PhilHealth deductible", "no balance billing").

### Examples

> **Do:** "Studies performed before 2 PM are read the same day by our radiologist."
> **Don't:** "We leverage cutting-edge imaging to deliver rapid diagnostic insights."

> **Do:** "One watcher per patient. Children under 7 are not permitted in patient rooms."
> **Don't:** "Please be advised that the hospital's visitor policy stipulates…"

---

## Visual foundations

### Colour
Three brand colours carry everything: **navy** for authority and structure,
**green** for reassurance and confirmation, **gold** for the single most
important action on a page. **Red is reserved for emergency** — never
decorative. Background is a warm off-white paper (`#f7f6f2`), not grey or pure
white; card surfaces are white against it. At most two background colours per
page: paper and navy.

- Navy 900 `#0e2559` — utility bar, page heroes, footer
- Navy 700 `#14357f` — primary buttons, links, icons
- Green 600 `#2f8b3c` — eyebrows, checkmarks, specialty labels, link hover
- Gold 500 `#e8b23a` — hero CTA, footer headings, on-navy accents
- Red 700 `#8f1d1d` — ER cards, emergency callouts, hotline

Ink is warm grey, never blue-black: `#14181f` → `#4a4741` → `#6d6a62` → `#8a8578`.
Four tint/ink pairs (info, success, notice, danger) cover all status colour.

### Type
Two families only. **Source Serif 4** (700) for every heading and for large
figures; **Source Sans 3** (400/500/600/700) for body, UI, and labels. Headings
carry negative tracking (−1px at 56px, −0.5px at 32px); eyebrows carry +1.4px
and uppercase. Body prose is 16/1.7 at a 70-character measure; card copy is
14.5–15/1.6. Nothing below 12px on desktop, nothing below 15px for mobile body.

### Spacing & layout
1240px max width, 24px gutters (16px mobile), 18px grid gap, 24px card padding
(18px mobile). Sections are 56–72px apart. Grids are `auto-fit` +
`minmax(280px, 1fr)` so they wrap rather than squeeze — the layout must survive
a 700px preview pane. The mockups use 14/18/22/26px as freely as 16/24; the
token scale keeps those real values rather than snapping to a 4pt grid.

### Backgrounds & imagery
Real photographs of the hospital's own rooms, staff, and equipment — warm
daylight, no gloss, no stock gestures. Heroes place a photo at 35–42% opacity
under a navy scrim (horizontal gradient on desktop, vertical on mobile) so
white type holds contrast. Elsewhere photos are full-colour with a 14–16px
radius. No gradients as decoration, no patterns, no textures, no illustration.
The only non-photographic graphic is the striped placeholder standing in for a
map embed.

### Cards, borders, radii
A card is white, a 1px `#e6e3da` hairline, and a 14–16px radius. Shadows are
rare: `--shadow-card` only for cards that overlap a hero, `--shadow-menu` for
dropdowns and drawers. Radii ladder: tags 6, inputs 9, buttons 10–11, cards
14–16, panels 18, pills 999. No inner shadows, no double borders, and never a
rounded card with a coloured left border only.

### States
Hover is a **colour change only**: links navy → green; nav items pick up a
`--surface-info` background; cards swap their hairline to navy; primary buttons
darken to navy 900; gold lightens to gold 300. No lift, no scale, no shadow
growth. Focus follows the browser default outline (to be replaced with a navy
ring — see open questions). Disabled is 50% opacity with pointer events off.

### Motion
Deliberately minimal: 120–180ms colour/border transitions on interactive
elements. Menus and drawers appear and disappear instantly. No entrance
animations, no parallax, no counters, no carousels. A hospital site is read
under stress; nothing should move while someone is reading a phone number.

### Transparency & blur
Used only on navy: `rgba(255,255,255,0.1–0.12)` fills for secondary buttons and
social tiles, `rgba(232,178,58,0.16)` for the hero capsule, and a
`rgba(10,18,38,0.5)` scrim behind the mobile drawer. No frosted glass.

### Fixed elements
The desktop header is sticky. On mobile, the top bar and the two-action
Call ER / Book bar are fixed, and every screen keeps the ER number one tap away.

---

## Iconography

No icon set was supplied with the source material, so the system standardises on
**Material Symbols Rounded, filled** (loaded from Google Fonts in
`tokens/fonts.css`, applied with the `.dch-icon` class or the `Icon`
component). This is a flagged substitution — if DCH has its own icon set, drop
the SVGs into `assets/icons/` and repoint `Icon`.

Rules:
- Sizes: 17–18px inline with text, 20–24px in rows, 26–32px as feature glyphs.
- Colour: navy 700 by default, green 600 for confirmations and eyebrow pairs,
  gold 500 on navy, red 100 on emergency red.
- Icons never appear alone without a label or an `aria-label`.
- Clinical vocabulary is fixed: `emergency` (ER), `pregnant_woman` (OB-Gyne),
  `child_care` (Pediatrics), `surgical` (Surgery), `radiology`/`monitor_heart`
  (Imaging/CT), `labs` (Laboratory), `cardiology` (Internal Medicine),
  `stethoscope` (physicians), `vaccines` (nursing/immunisation),
  `event_available` (booking), `check_circle` (checklists).
- **No emoji, and no hand-drawn SVG icons.**

---

## Index

| Path | What it is |
| --- | --- |
| `styles.css` | Global CSS entry point — the only file consumers link |
| `tokens/` | `fonts`, `colors`, `typography`, `spacing`, `elevation`, `motion`, `base` |
| `guidelines/` | 19 foundation specimen cards (Colors, Type, Spacing, Brand) |
| `components/actions/` | `Button`, `IconButton`, `ArrowLink` |
| `components/forms/` | `TextField`, `SelectField`, `SearchBar`, `FileDrop` |
| `components/content/` | `Icon`, `Card`, `SectionHeading`, `Badge`, `Chip`, `ListRow`, `StatBlock`, `IconFeature`, `ChecklistItem`, `DoctorCard`, `ArticleCard`, `Callout` |
| `components/navigation/` | `UtilityBar`, `SiteHeader`, `PageHero`, `SiteFooter`, `MobileTopBar`, `MobileDrawer`, `MobileActionBar`, `Breadcrumb` |
| `ui_kits/website/` | Desktop recreation: home, services, staff & leadership, news article |
| `ui_kits/mobile/` | Mobile recreation: home, services, article, nav drawer |
| `assets/` | Logo, facility and staff photography, director portrait |
| `SKILL.md` | Agent-skill wrapper for use outside this workspace |

### Intentional additions
- **`Icon`** — a wrapper over Material Symbols, added because the source ships no
  icon primitive and every other component needs one.
- **`Chip`, `Badge`, `ListRow`** — extracted from repeated patterns in the
  approved mockups rather than invented.

### Open questions for DCH
1. **Fonts.** Source Serif 4 + Source Sans 3 are stand-ins chosen to match the
   mockups. If the hospital has licensed faces (or a printed letterhead font),
   send the files and we will swap them.
2. **Icons.** Material Symbols Rounded is a substitution — confirm or replace.
3. **Logo.** Only the circular raster mark was provided. A vector (SVG/AI) and a
   horizontal lockup would let us render the header crisply at every size.
4. **Real content.** Doctor names, clinic schedules, room rates, PhilHealth case
   rates, and phone numbers in this system are placeholders from the mockups.
5. **Focus states.** Currently browser default; propose a 2px navy 700 ring with
   a 2px offset.
