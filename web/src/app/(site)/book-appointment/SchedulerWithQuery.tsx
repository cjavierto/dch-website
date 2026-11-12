"use client";

import { useSearchParams } from "next/navigation";
import type { ComponentProps } from "react";
import { Scheduler } from "./Scheduler";

/** Starts on the doctor named in ?doctor=slug. Keyed so it restarts once the URL is known. */
export function SchedulerWithQuery(props: Omit<ComponentProps<typeof Scheduler>, "initialDoctor">) {
  const doctor = useSearchParams().get("doctor");
  return <Scheduler key={doctor ?? ""} {...props} initialDoctor={doctor} />;
}
