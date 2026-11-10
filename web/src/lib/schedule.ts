/**
 * Doctor clinic schedules: one row per clinic session ("Mon 9:00–12:00").
 * Days are 0 = Mon … 5 = Sat; times are 24-hour "HH:MM". A session without
 * times means "in on this day" with hours that vary (on call, OR schedule…).
 * Shared by the directory, the booking picker and the admin row labels.
 */
import type { ClinicSession } from "@/lib/types";

export const WEEKDAYS = [
  { short: "M", label: "Mon", full: "Monday" },
  { short: "T", label: "Tue", full: "Tuesday" },
  { short: "W", label: "Wed", full: "Wednesday" },
  { short: "Th", label: "Thu", full: "Thursday" },
  { short: "F", label: "Fri", full: "Friday" },
  { short: "S", label: "Sat", full: "Saturday" },
];

export const toMinutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));

const meridiem = (t: string) => {
  const m = toMinutes(t);
  return m === 12 * 60 ? "NN" : m >= 12 * 60 ? "PM" : "AM";
};
const clock = (t: string) => {
  const m = toMinutes(t);
  return `${Math.floor(m / 60) % 12 || 12}:${String(m % 60).padStart(2, "0")}`;
};

/** "13:40" → "1:40 PM" (12:00 NN for noon, per the house style). */
export const formatTime = (t: string) => `${clock(t)} ${meridiem(t)}`;

/** "13:00"–"17:00" → "1:00 – 5:00 PM"; "09:00"–"12:00" → "9:00 AM – 12:00 NN". */
export function formatTimeRange(from: string, to: string) {
  const sameHalf = meridiem(from) === meridiem(to) && meridiem(from) !== "NN";
  return `${sameHalf ? clock(from) : formatTime(from)} – ${formatTime(to)}`;
}

export const isTimed = (s: ClinicSession): s is Required<ClinicSession> => Boolean(s.from && s.to);

/** Sessions on one weekday, earliest first. */
export const sessionsOn = (schedule: ClinicSession[], day: number) =>
  schedule.filter((s) => s.day === day).sort((a, b) => (a.from ?? "").localeCompare(b.from ?? ""));

/** Clinic days, 0 = Mon … 5 = Sat, in order. */
export const scheduleDays = (schedule: ClinicSession[]) => [...new Set(schedule.map((s) => s.day))].sort((a, b) => a - b);

/** Text for one day's sessions: "9:00 AM – 12:00 NN, 2:00 – 5:00 PM", or "" when hours vary. */
export const dayHours = (sessions: ClinicSession[]) =>
  sessions.filter(isTimed).map((s) => formatTimeRange(s.from, s.to)).join(", ");

/**
 * Days with the same hours grouped into lines:
 * ["Mon, Thu · 9:00 AM – 12:00 NN", "Tue · 1:00 – 5:00 PM"].
 */
export function scheduleSummary(schedule: ClinicSession[]) {
  const groups = new Map<string, number[]>();
  for (const day of scheduleDays(schedule)) {
    const hours = dayHours(sessionsOn(schedule, day));
    groups.set(hours, [...(groups.get(hours) ?? []), day]);
  }
  return [...groups].map(([hours, days]) => {
    const names = days.map((d) => WEEKDAYS[d].label).join(", ");
    return hours ? `${names} · ${hours}` : names;
  });
}
