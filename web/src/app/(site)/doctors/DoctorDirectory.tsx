"use client";

import { useId, useState } from "react";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/PageHero";
import { Avatar } from "@/components/ui/Avatar";
import { FilterChips } from "@/components/ui/FilterChips";
import type { Doctor } from "@/lib/types";

const DAYS = [
  { short: "M", label: "Mon", full: "Monday" },
  { short: "T", label: "Tue", full: "Tuesday" },
  { short: "W", label: "Wed", full: "Wednesday" },
  { short: "Th", label: "Thu", full: "Thursday" },
  { short: "F", label: "Fri", full: "Friday" },
  { short: "S", label: "Sat", full: "Saturday" },
];

/**
 * Filterable consultant list: name search and specialty in the hero search
 * card, specialty chips and a clinic-day filter above the list. No email or
 * phone per doctor — bookings go through the hospital.
 */
export function DoctorDirectory({ doctors, groups }: { doctors: Doctor[]; groups: string[] }) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const ids = useId();

  const q = query.trim().toLowerCase();
  const shown = doctors.filter(
    (d) =>
      (!q || d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q)) &&
      (!group || d.group === group) &&
      (day === null || d.days.includes(Number(day))),
  );
  const groupOptions = groups.map((g) => ({ value: g, label: g }));
  const dayOptions = DAYS.map((d, i) => ({ value: String(i), label: d.label }));

  return (
    <>
      <PageHero
        title="Doctors Directory"
        lead="Our consultants and their clinic days. Schedules can change on short notice — call the OPD desk to confirm before travelling."
        crumbs={[{ label: "Doctors Directory" }]}
      >
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            document.getElementById(`${ids}-results`)?.focus();
          }}
          className="mt-[18px] flex max-w-[820px] flex-wrap gap-2.5 rounded-card bg-white p-3 shadow-[var(--shadow-float)] nav:mt-[26px]"
        >
          <label className="flex flex-[1_1_240px] items-center gap-[9px] rounded-button border border-line-200 px-3.5 py-[11px] focus-within:border-navy-700">
            <Icon name="search" size={21} className="text-ink-400" />
            <span className="sr-only">Doctor name or specialty</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Doctor name"
              className="w-full bg-transparent text-[15px] outline-none placeholder:text-ink-400"
            />
          </label>
          <label className="relative flex flex-[1_1_200px] items-center gap-[9px] rounded-button border border-line-200 px-3.5 py-[11px] text-[15px] text-ink-700 focus-within:border-navy-700">
            <Icon name="stethoscope" size={21} className="text-ink-400" />
            <span className="sr-only">Specialty</span>
            <select
              value={group ?? ""}
              onChange={(e) => setGroup(e.target.value || null)}
              className="w-full appearance-none bg-transparent pr-7 outline-none"
            >
              <option value="">All specialties</option>
              {groups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <Icon name="expand_more" size={21} className="pointer-events-none absolute right-3.5 text-ink-400" />
          </label>
          <button
            type="submit"
            className="w-full rounded-button bg-navy-700 px-[22px] py-3 text-[15px] font-bold text-white hover:bg-navy-900 sm:w-auto"
          >
            Search
          </button>
        </form>
      </PageHero>

      <div className="page-container">
        <div className="mt-[18px] flex flex-col gap-3 nav:mt-8">
          <FilterChips label="Filter by specialty" options={groupOptions} value={group} onChange={setGroup} />
          <div className="flex flex-col items-stretch gap-2 nav:flex-row nav:flex-wrap nav:items-center">
            <span className="mr-1 flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-500">
              <Icon name="calendar_month" size={18} className="text-ink-400" />
              Clinic day
            </span>
            <FilterChips
              label="Filter by clinic day"
              allLabel="Any day"
              options={dayOptions}
              value={day}
              onChange={setDay}
            />
          </div>
        </div>

        <p
          id={`${ids}-results`}
          tabIndex={-1}
          aria-live="polite"
          className="mt-5 mb-4 text-[14.5px] text-ink-500 outline-none"
        >
          Showing {shown.length} of {doctors.length} consultants
        </p>

        {shown.length === 0 ? (
          <p className="rounded-card border border-line-200 bg-white p-5 text-[15px] text-ink-700">
            No consultants match those filters. Try another day or specialty, or call the OPD desk.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {shown.map((d) => (
              <li
                key={d.slug}
                className="flex flex-wrap items-center gap-4 rounded-card-lg border border-line-200 bg-white p-4 nav:p-[18px]"
              >
                <Avatar name={d.name} initials={d.initials} photo={d.photo} size={58} />
                <div className="min-w-0 flex-[1_1_220px]">
                  <h2 className="mb-[3px] text-[17px] font-bold nav:text-[17.5px]">{d.name}</h2>
                  <div className="text-sm font-semibold text-green-600">{d.specialty}</div>
                </div>
                <ul className="flex flex-[1_1_300px] gap-[7px]" aria-label="Clinic days">
                  {DAYS.map((dd, i) => {
                    const on = d.days.includes(i);
                    return (
                      <li
                        key={dd.short}
                        className={`min-w-0 flex-1 rounded-[8px] py-[7px] text-center text-[12.5px] ${
                          on ? "bg-navy-700 font-bold text-white" : "bg-line-050 font-semibold text-ink-300"
                        }`}
                      >
                        <span aria-hidden="true">{dd.short}</span>
                        <span className="sr-only">
                          {dd.full}: {on ? "clinic" : "no clinic"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <div className="flex flex-[1_1_180px] items-center gap-2 text-sm text-ink-700">
                  <Icon name="schedule" size={18} className="text-ink-400" />
                  {d.hours}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
