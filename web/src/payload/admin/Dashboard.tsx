/**
 * Admin home (/admin), replacing Payload's default grid of cards. Layout
 * follows the Dashboard screen in designs/DCH Admin Portal.dc.html: counts,
 * today's appointments, unread inbox items, quick actions, recent edits, then
 * every admin section grouped as in the sidebar. Reads live data on each
 * visit (the admin is rendered per request).
 */
import type { DashboardViewServerProps } from "@payloadcms/next/views";
import { Gutter } from "@payloadcms/ui";
import Link from "next/link";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { APPOINTMENT_STATUSES, manilaDay } from "@/lib/appointments";
import { CONTACT_SUBJECTS } from "@/lib/contact";
import { formatTime } from "@/lib/schedule";
import type { AdminIconName } from "./icons";

const SECTION_ICONS: Record<string, AdminIconName> = {
  services: "medical_services",
  "news-posts": "campaign",
  articles: "article",
  doctors: "stethoscope",
  "staff-members": "groups",
  "job-postings": "work",
  faqs: "quiz",
  "contact-submissions": "mail",
  "booking-requests": "event_available",
  "job-applications": "assignment_ind",
  "applicant-files": "description",
  media: "photo_library",
  users: "manage_accounts",
  "audit-log": "history",
  "about-page": "info",
  "vision-page": "flag",
  "patients-page": "personal_injury",
  "careers-page": "badge",
  "site-settings": "settings",
  "homepage-settings": "home",
  "legal-pages": "gavel",
};

const GROUP_BLURBS: Record<string, string> = {
  Content: "Pages, doctors, news and everything visitors read.",
  Inbox: "Messages, appointments and job applications from the website.",
  Library: "Photos used across the site.",
  Settings: "Contact details, homepage, admin users and the activity log.",
};

const DAY_MS = 86_400_000;

const icon = (name: AdminIconName, className = "dch-dash__icon") => (
  <span className={`dch-ms ${className}`} aria-hidden="true">
    {name}
  </span>
);

const labelText = (label: unknown): string =>
  typeof label === "string" ? label : label && typeof label === "object" ? String(Object.values(label)[0] ?? "") : "";

function greeting(now: Date) {
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Manila" }).format(now));
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

/** "5 min ago", "3 h ago", "Yesterday", "Nov 12". */
function ago(iso: string, now: Date) {
  const mins = Math.round((now.getTime() - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  if (mins < 24 * 60) return `${Math.round(mins / 60)} h ago`;
  const today = manilaDay(now.toISOString());
  const day = manilaDay(iso);
  if (day === manilaDay(new Date(now.getTime() - DAY_MS).toISOString())) return "Yesterday";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...(day.slice(0, 4) !== today.slice(0, 4) ? { year: "numeric" } : {}),
    timeZone: "Asia/Manila",
  }).format(new Date(iso));
}

const statusLabel = (value: string) => APPOINTMENT_STATUSES.find((s) => s.value === value)?.label ?? value;
const subjectLabel = (value: string) => CONTACT_SUBJECTS.find((s) => s.value === value)?.label ?? value;

function Panel({ title, action, children }: { title: string; action?: { href: string; label: string }; children: ReactNode }) {
  return (
    <section className="dch-dash__panel">
      <div className="dch-dash__panel-head">
        <h2>{title}</h2>
        {action && (
          <Link href={action.href} className="dch-dash__panel-link">
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Empty({ name, children }: { name: AdminIconName; children: ReactNode }) {
  return (
    <div className="dch-dash__empty">
      {icon(name)}
      <span>{children}</span>
    </div>
  );
}

export async function Dashboard({ payload, user, navGroups = [] }: DashboardViewServerProps) {
  // Live counts and the current time: render on every visit.
  await connection();
  const admin = payload.config.routes.admin;
  const collection = (slug: string) => `${admin}/collections/${slug}`;
  const now = new Date();
  const today = manilaDay(now.toISOString());
  const weekEnd = manilaDay(new Date(now.getTime() + 6 * DAY_MS).toISOString());
  const active = { in: ["requested", "confirmed"] };

  const [todayAppts, weekAppts, unread, applications, activity] = await Promise.all([
    payload.find({
      collection: "booking-requests",
      where: { date: { equals: today }, status: { not_equals: "declined" } },
      sort: "time",
      limit: 8,
      depth: 1,
    }),
    payload.count({
      collection: "booking-requests",
      where: { and: [{ date: { greater_than_equal: today } }, { date: { less_than_equal: weekEnd } }, { status: active }] },
    }),
    payload.find({ collection: "contact-submissions", where: { status: { equals: "new" } }, sort: "-createdAt", limit: 4, depth: 0 }),
    payload.find({ collection: "job-applications", where: { status: { equals: "new" } }, sort: "-createdAt", limit: 3, depth: 1 }),
    payload.find({
      collection: "audit-log",
      where: { action: { not_in: ["login", "logout"] } },
      sort: "-createdAt",
      limit: 6,
      depth: 0,
    }),
  ]);

  const todayActive = todayAppts.docs.filter((a) => a.status === "requested" || a.status === "confirmed").length;
  const firstName = (user && "name" in user && typeof user.name === "string" ? user.name : "").split(" ")[0];
  const dateLine = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  }).format(now);

  const stats: { icon: AdminIconName; value: number; label: string; href: string; tone: string }[] = [
    { icon: "event_available", value: todayActive, label: "Appointments today", href: collection("booking-requests"), tone: "navy" },
    { icon: "date_range", value: weekAppts.totalDocs, label: "Upcoming, next 7 days", href: collection("booking-requests"), tone: "navy" },
    { icon: "mark_email_unread", value: unread.totalDocs, label: "Unread messages", href: collection("contact-submissions"), tone: unread.totalDocs ? "alert" : "navy" },
    { icon: "assignment_ind", value: applications.totalDocs, label: "New job applications", href: collection("job-applications"), tone: "green" },
  ];

  const quickActions: { icon: AdminIconName; label: string; href: string; primary?: boolean }[] = [
    { icon: "campaign", label: "Post announcement", href: `${collection("news-posts")}/create`, primary: true },
    { icon: "person_add", label: "Add doctor", href: `${collection("doctors")}/create` },
    { icon: "article", label: "Write health article", href: `${collection("articles")}/create` },
    { icon: "upload", label: "Upload photo", href: `${collection("media")}/create` },
  ];

  return (
    <Gutter className="dch-dash">
      <header className="dch-dash__hero">
        <div>
          <p className="dch-dash__eyebrow">{dateLine}</p>
          <h1 className="dch-dash__title">
            {greeting(now)}
            {firstName ? `, ${firstName}` : ""}.
          </h1>
          <p className="dch-dash__lede">Here is what needs attention on the website today.</p>
        </div>
        <a href="/" target="_blank" rel="noopener" className="dch-dash__view-site">
          {icon("visibility", "dch-dash__btn-icon")}
          View site
        </a>
      </header>

      <div className="dch-dash__stats">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className={`dch-dash__stat dch-dash__stat--${s.tone}`}>
            {icon(s.icon, "dch-dash__stat-icon")}
            <span className="dch-dash__stat-value">{s.value}</span>
            <span className="dch-dash__stat-label">{s.label}</span>
          </Link>
        ))}
      </div>

      <div className="dch-dash__columns">
        <div className="dch-dash__column">
          <Panel title="Today's appointments" action={{ href: collection("booking-requests"), label: "All appointments" }}>
            {todayAppts.docs.length ? (
              <ul className="dch-dash__list">
                {todayAppts.docs.map((a) => {
                  const doctor = typeof a.doctor === "object" && a.doctor ? a.doctor.name : null;
                  return (
                    <li key={a.id}>
                      <Link href={`${collection("booking-requests")}/${a.id}`} className="dch-dash__row">
                        <span className="dch-dash__time">{formatTime(a.time)}</span>
                        <span className="dch-dash__row-main">
                          <span className="dch-dash__row-title">{a.name}</span>
                          <span className="dch-dash__row-meta">{[doctor, a.department].filter(Boolean).join(" · ")}</span>
                        </span>
                        <span className={`dch-dash__badge dch-dash__badge--${a.status}`}>{statusLabel(a.status)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <Empty name="event_available">No appointments booked for today.</Empty>
            )}
          </Panel>

          <Panel title="Recent edits" action={{ href: collection("audit-log"), label: "Activity log" }}>
            {activity.docs.length ? (
              <ul className="dch-dash__feed">
                {activity.docs.map((e) => (
                  <li key={e.id}>
                    <span className="dch-dash__feed-dot" aria-hidden="true" />
                    <span className="dch-dash__row-main">
                      <span className="dch-dash__feed-text">{e.summary}</span>
                      <span className="dch-dash__row-meta">
                        {[e.userName, ago(e.createdAt, now)].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty name="history">Changes made in the admin will show here.</Empty>
            )}
          </Panel>
        </div>

        <div className="dch-dash__column">
          <Panel title="Unread messages" action={{ href: collection("contact-submissions"), label: "Inbox" }}>
            {unread.docs.length ? (
              <ul className="dch-dash__list">
                {unread.docs.map((m) => (
                  <li key={m.id}>
                    <Link href={`${collection("contact-submissions")}/${m.id}`} className="dch-dash__row">
                      {icon("mail", "dch-dash__row-icon")}
                      <span className="dch-dash__row-main">
                        <span className="dch-dash__row-title">{subjectLabel(m.subject)}</span>
                        <span className="dch-dash__row-meta">
                          {m.name} · {ago(m.createdAt, now)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty name="mark_email_read">All caught up. No new messages.</Empty>
            )}
          </Panel>

          {applications.docs.length > 0 && (
            <Panel title="New job applications" action={{ href: collection("job-applications"), label: "All applications" }}>
              <ul className="dch-dash__list">
                {applications.docs.map((j) => (
                  <li key={j.id}>
                    <Link href={`${collection("job-applications")}/${j.id}`} className="dch-dash__row">
                      {icon("assignment_ind", "dch-dash__row-icon")}
                      <span className="dch-dash__row-main">
                        <span className="dch-dash__row-title">{j.name}</span>
                        <span className="dch-dash__row-meta">
                          {[typeof j.job === "object" && j.job ? j.job.title : null, ago(j.createdAt, now)].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          <section className="dch-dash__actions">
            <h2>Quick actions</h2>
            <div className="dch-dash__action-list">
              {quickActions.map((q) => (
                <Link key={q.label} href={q.href} className={q.primary ? "dch-dash__action dch-dash__action--primary" : "dch-dash__action"}>
                  {icon(q.icon, "dch-dash__btn-icon")}
                  {q.label}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="dch-dash__sections" aria-labelledby="dch-dash-sections">
        <h2 id="dch-dash-sections" className="dch-dash__sections-title">
          All sections
        </h2>
        <div className="dch-dash__groups">
          {navGroups.map((group) => (
            <div key={group.label} className="dch-dash__group">
              <h3>{group.label}</h3>
              {GROUP_BLURBS[group.label] && <p>{GROUP_BLURBS[group.label]}</p>}
              <ul>
                {group.entities.map((e) => (
                  <li key={`${e.type}-${e.slug}`}>
                    <Link href={`${admin}/${e.type}/${e.slug}`} className="dch-dash__section-link">
                      {icon(SECTION_ICONS[e.slug] ?? "chevron_right", "dch-dash__row-icon")}
                      <span>{labelText(e.label)}</span>
                      {icon("chevron_right", "dch-dash__chevron")}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </Gutter>
  );
}
