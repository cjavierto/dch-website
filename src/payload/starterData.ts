/**
 * Starter content shared by the seed script and migrations that add new
 * fields to an existing database. No server-only imports.
 */
import { doctors } from "@/content/people";
import { patientRightsPage, privacyPage } from "@/content/legal";
import { blocksToLexical } from "./richText";

/** Draft privacy notice / patient rights copy for the legal-pages global. */
export function legalPagesData() {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
  const page = (p: typeof privacyPage) => ({
    intro: p.intro,
    body: blocksToLexical(p.body) as never,
    // Noon Manila, so no timezone shifts the calendar day.
    lastUpdated: `${today}T12:00:00+08:00`,
  });
  return { privacy: page(privacyPage), patientRights: page(patientRightsPage) };
}

/** The footer's starting logos: the two badges the prototype shows. */
export function accreditationBadgesData(dohLicenceLevel: string) {
  return [
    { name: "PhilHealth", subtitle: "Accredited facility" },
    { name: "Department of Health", subtitle: `${dohLicenceLevel} licence` },
  ];
}

/** Prototype online-booking clinic windows, by doctor slug. Only the
    2026-10-22 migration reads this (it predates per-day schedules), so it
    takes each bookable doctor's first timed session. */
export const doctorBookingTimes = new Map(
  doctors.flatMap((d) => {
    const s = d.bookable ? d.schedule.find((x) => x.from && x.to) : undefined;
    return s ? [[d.slug, { from: s.from!, to: s.to! }] as const] : [];
  }),
);
