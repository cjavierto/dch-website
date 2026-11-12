"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { monthDays, shiftMonth } from "@/lib/appointments";
import { addDays, BOOKING_WINDOW_DAYS, formatBookingDate, formatTime, manilaToday } from "@/lib/booking";
import { loadDay, loadMonth } from "./actions";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const PARTS = [
  { label: "Morning", test: (t: string) => t < "12:00" },
  { label: "Afternoon", test: (t: string) => t >= "12:00" && t < "17:00" },
  { label: "Evening", test: (t: string) => t >= "17:00" },
];

/**
 * Month calendar with the free days highlighted, and the free times of the
 * chosen day beside it (below it on phones). Opens on the first month with
 * a free day and selects that day, so most patients only tap a time.
 */
export function DayTimePicker({
  doctorSlug,
  onPick,
  current,
}: {
  doctorSlug: string;
  onPick: (day: string, time: string) => void;
  /** The patient's existing appointment, when rescheduling. */
  current?: { day: string; time: string };
}) {
  const today = manilaToday();
  const firstMonth = addDays(today, 1).slice(0, 7);
  const lastMonth = addDays(today, BOOKING_WINDOW_DAYS).slice(0, 7);

  const [month, setMonth] = useState(firstMonth);
  const [monthData, setMonthData] = useState<{ month: string; days: Record<string, number> } | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [dayData, setDayData] = useState<{ day: string; slots: string[] } | null>(null);
  const timesRef = useRef<HTMLDivElement>(null);
  const searching = useRef(true);
  const userPicked = useRef(false);

  // Data is kept with the month/day it belongs to; anything else is "loading".
  const open = monthData?.month === month ? monthData.days : null;
  const slots = day && dayData?.day === day ? dayData.slots : null;

  // Load the month; on first open skip ahead to a month with a free day.
  useEffect(() => {
    let live = true;
    loadMonth(doctorSlug, month).then((days) => {
      if (!live) return;
      const first = Object.keys(days).sort()[0];
      if (!first && searching.current && month < lastMonth) {
        setMonth(shiftMonth(month, 1));
        return;
      }
      searching.current = false;
      setMonthData({ month, days });
      if (!userPicked.current) setDay(first ?? null);
    });
    return () => {
      live = false;
    };
  }, [doctorSlug, month, lastMonth]);

  useEffect(() => {
    if (!day) return;
    let live = true;
    loadDay(doctorSlug, day).then((s) => live && setDayData({ day, slots: s }));
    return () => {
      live = false;
    };
  }, [doctorSlug, day]);

  const pickDay = (d: string) => {
    userPicked.current = true;
    setDay(d);
    // On phones the times are under the calendar.
    requestAnimationFrame(() => {
      if (window.matchMedia("(max-width: 959px)").matches) timesRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  };

  const changeMonth = (n: number) => {
    userPicked.current = false;
    setDay(null);
    setMonth(shiftMonth(month, n));
  };

  const [y, m] = month.split("-").map(Number);
  const leading = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const label = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, 1)));
  const days = monthDays(month);
  const none = open !== null && Object.keys(open).length === 0;

  return (
    <div className="grid gap-6 nav:grid-cols-[minmax(0,1fr)_230px] nav:gap-7">
      {/* Calendar */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <span className="flex-1 text-[16px] font-bold" aria-live="polite">
            {label}
          </span>
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            disabled={month <= firstMonth}
            aria-label="Previous month"
            className="flex size-10 items-center justify-center rounded-full text-navy-700 hover:bg-navy-050 disabled:pointer-events-none disabled:text-ink-300"
          >
            <Icon name="chevron_right" size={22} className="rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            disabled={month >= lastMonth}
            aria-label="Next month"
            className="flex size-10 items-center justify-center rounded-full text-navy-700 hover:bg-navy-050 disabled:pointer-events-none disabled:text-ink-300"
          >
            <Icon name="chevron_right" size={22} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-y-1.5 text-center">
          {WEEKDAYS.map((w) => (
            <span key={w} aria-hidden="true" className="pb-1.5 text-[11.5px] font-bold tracking-[0.6px] text-ink-400 uppercase">
              {w}
            </span>
          ))}
          {Array.from({ length: leading }, (_, i) => (
            <span key={`b${i}`} aria-hidden="true" />
          ))}
          {days.map((d) => {
            const free = open?.[d] ?? 0;
            const on = d === day;
            const isToday = d === today;
            const isCurrent = current?.day === d;
            return (
              <span key={d} className="flex justify-center">
                <button
                  type="button"
                  disabled={!free}
                  aria-pressed={on}
                  aria-label={`${formatBookingDate(d)}${free ? `, ${free} ${free === 1 ? "time" : "times"} free` : ", not available"}${isCurrent ? ", your current appointment" : ""}`}
                  onClick={() => pickDay(d)}
                  className={`relative flex size-11 items-center justify-center rounded-full text-[15px] transition-colors duration-[120ms] nav:size-12 ${
                    on
                      ? "bg-navy-700 font-bold text-white"
                      : free
                        ? "bg-navy-050 font-bold text-navy-700 hover:bg-navy-700 hover:text-white"
                        : "cursor-default text-ink-300"
                  }`}
                >
                  {Number(d.slice(8))}
                  {(isToday || isCurrent) && (
                    <span
                      aria-hidden="true"
                      className={`absolute bottom-1.5 size-1 rounded-full ${on ? "bg-white" : isCurrent ? "bg-green-600" : "bg-ink-400"}`}
                    />
                  )}
                </button>
              </span>
            );
          })}
        </div>

        {open === null && <p className="mt-3 text-[13.5px] text-ink-500">Checking free days…</p>}
        {none && (
          <p className="mt-3 rounded-input bg-paper px-3.5 py-3 text-[14px] text-ink-700">
            {month < lastMonth ? "No free times this month. Try the next month." : "No free times in the next two months. Please call us to book."}
          </p>
        )}
      </div>

      {/* Times */}
      <div ref={timesRef} className="scroll-mt-4">
        {!day ? (
          <p className="text-[14.5px] text-ink-500 nav:pt-14">{open === null ? "" : "Pick a highlighted day to see the times."}</p>
        ) : (
          <>
            <h3 className="mb-3 text-[15.5px] font-bold">{formatBookingDate(day).replace(/, \d{4}$/, "")}</h3>
            {slots === null ? (
              <p className="text-[14px] text-ink-500" aria-live="polite">
                Loading times…
              </p>
            ) : slots.length === 0 ? (
              <p className="text-[14px] text-ink-500">This day just filled up. Please pick another day.</p>
            ) : (
              <div className="flex flex-col gap-4 nav:max-h-[400px] nav:overflow-y-auto nav:pr-1">
                {PARTS.map((part) => {
                  const times = slots.filter(part.test);
                  if (!times.length) return null;
                  return (
                    <div key={part.label}>
                      <p className="mb-2 text-[11.5px] font-bold tracking-[0.8px] text-ink-400 uppercase">{part.label}</p>
                      <div className="grid grid-cols-3 gap-2 nav:grid-cols-1">
                        {times.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => onPick(day, t)}
                            className="rounded-button border border-navy-700/40 bg-white py-3 text-center text-[15px] font-bold text-navy-700 transition-colors duration-[120ms] hover:border-navy-700 hover:bg-navy-700 hover:text-white"
                          >
                            {formatTime(t)}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
