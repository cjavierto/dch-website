"use client";

import { useRowLabel } from "@payloadcms/ui";

/** Collapsed shortcut-card rows show the card title. */
export function QuickLinkLabel() {
  const { data, rowNumber } = useRowLabel<{ title?: string | null }>();
  return <span>{data?.title || `Shortcut card ${String((rowNumber ?? 0) + 1).padStart(2, "0")}`}</span>;
}
