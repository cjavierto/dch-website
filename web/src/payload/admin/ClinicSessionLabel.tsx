"use client";

import { useRowLabel } from "@payloadcms/ui";
import { formatTimeRange, WEEKDAYS } from "@/lib/schedule";

/** Collapsed clinic-session rows read "Monday · 9:00 AM – 12:00 NN". */
export function ClinicSessionLabel() {
  const { data, rowNumber } = useRowLabel<{ day?: string | null; from?: string | null; to?: string | null }>();
  const day = data?.day != null && data.day !== "" ? WEEKDAYS[Number(data.day)]?.full : undefined;
  if (!day) return <span>Clinic session {String((rowNumber ?? 0) + 1).padStart(2, "0")}</span>;
  const hours = data.from && data.to ? formatTimeRange(data.from, data.to) : "hours vary";
  return (
    <span>
      {day} · {hours}
    </span>
  );
}
