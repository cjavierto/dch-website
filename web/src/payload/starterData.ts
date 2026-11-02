/**
 * Starter content shared by the seed script and migrations that add new
 * fields to an existing database. No server-only imports.
 */
import { doctors } from "@/content/people";
import { patientRightsPage, privacyPage } from "@/content/legal";
import type { Doctor as PayloadDoctor } from "@/payload-types";
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

/** Prototype online-booking clinic windows, by doctor slug. */
export const doctorBookingTimes = new Map(
  doctors.filter((d) => d.booking).map((d) => [d.slug, d.booking as NonNullable<PayloadDoctor["booking"]>] as const),
);
