"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { Field, fieldProps, Honeypot, inputClass } from "@/components/ui/FormField";
import {
  addDays,
  BOOKING_WINDOW_DAYS,
  clinicSlots,
  DAY_NAMES,
  DEPARTMENT_ICONS,
  formatBookingDate,
  formatTime,
  isBookableDate,
  manilaToday,
  REASON_MAX,
  validateBookingDetails,
  type BookableDoctor,
  type BookingDetails,
  type BookingErrors,
} from "@/lib/booking";
import { telHref } from "@/lib/format";
import { fetchTakenSlots, submitBooking, type BookingState } from "./actions";

const P = "book";
const WEEK = ["M", "T", "W", "Th", "F", "S"];
const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DETAIL_ORDER: (keyof BookingDetails)[] = ["name", "mobile", "philhealth", "firstVisit", "reason"];

/**
 * Progressive 4-step picker: each step appears once the previous one is
 * chosen. Submits a request — OPD staff confirm by SMS.
 */
export function BookingPicker({
  doctors,
  departments,
  emergencyNumber,
}: {
  doctors: BookableDoctor[];
  departments: string[];
  emergencyNumber: string;
}) {
  const [dept, setDept] = useState<string | null>(null);
  const [doctorSlug, setDoctorSlug] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [taken, setTaken] = useState<string[] | null>(null);
  const [month, setMonth] = useState<string | null>(null);

  const doctor = doctors.find((d) => d.slug === doctorSlug) ?? null;
  const deptDoctors = doctors.filter((d) => d.group === dept);

  const doctorRef = useRef<HTMLHeadingElement>(null);
  const dateRef = useRef<HTMLHeadingElement>(null);
  const timeRef = useRef<HTMLHeadingElement>(null);
  const detailsRef = useRef<HTMLHeadingElement>(null);

  /** Moves focus to the step that just appeared (no smooth scroll — no motion). */
  const focusSoon = (ref: React.RefObject<HTMLHeadingElement | null>) =>
    requestAnimationFrame(() => {
      ref.current?.scrollIntoView({ block: "nearest" });
      ref.current?.focus({ preventScroll: true });
    });

  const pickDept = (d: string) => {
    setDept(d);
    setDoctorSlug(null);
    setDate(null);
    setSlot(null);
    focusSoon(doctorRef);
  };
  const pickDoctor = (slug: string) => {
    setDoctorSlug(slug);
    setDate(null);
    setSlot(null);
    setMonth(manilaToday().slice(0, 7));
    focusSoon(dateRef);
  };
  const pickDate = (d: string) => {
    setDate(d);
    setSlot(null);
    setTaken(null);
    focusSoon(timeRef);
  };
  const pickSlot = (t: string) => {
    setSlot(t);
    focusSoon(detailsRef);
  };
  const reset = () => {
    setDept(null);
    setDoctorSlug(null);
    setDate(null);
    setSlot(null);
  };

  // Load taken slots whenever a date is chosen.
  useEffect(() => {
    if (!doctorSlug || !date) return;
    let current = true;
    fetchTakenSlots(doctorSlug, date).then((t) => current && setTaken(t));
    return () => {
      current = false;
    };
  }, [doctorSlug, date]);

  const steps = [
    { label: "Department", done: Boolean(dept) },
    { label: "Doctor", done: Boolean(doctor) },
    { label: "Date", done: Boolean(date) },
    { label: "Time", done: Boolean(slot) },
  ];

  return (
    <div className="rounded-card-lg border border-line-200 bg-white p-[18px] nav:p-7">
      {/* Progress */}
      <ol className="mb-6 flex flex-wrap gap-2 nav:mb-[26px]" aria-label="Steps">
        {steps.map((s, i) => {
          const active = !s.done && (i === 0 || steps[i - 1].done);
          return (
            <li
              key={s.label}
              aria-current={active ? "step" : undefined}
              className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-[13.5px] font-semibold ${
                s.done
                  ? "bg-green-050 text-green-900"
                  : active
                    ? "bg-navy-050 text-navy-700"
                    : "border border-line-100 bg-paper text-ink-400"
              }`}
            >
              <span
                className={`inline-flex size-5 flex-none items-center justify-center rounded-full text-[11.5px] font-bold ${
                  s.done ? "bg-green-600 text-white" : active ? "bg-navy-700 text-white" : "bg-line-200 text-ink-400"
                }`}
              >
                {i + 1}
              </span>
              {s.label}
              <span className="sr-only">{s.done ? " (done)" : ""}</span>
            </li>
          );
        })}
      </ol>

      {/* 1. Department */}
      <section className="mb-6">
        <h2 className="mb-3 text-[17px] font-bold">1. Choose a department</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(170px,100%),1fr))] gap-2.5">
          {departments.map((d) => {
            const on = dept === d;
            const n = doctors.filter((x) => x.group === d).length;
            return (
              <button
                key={d}
                type="button"
                aria-pressed={on}
                onClick={() => pickDept(d)}
                className={`flex items-center gap-[11px] rounded-[12px] border p-3.5 text-left text-ink-900 transition-colors duration-[120ms] hover:border-navy-700 ${
                  on ? "border-navy-700 bg-navy-050" : "border-line-200 bg-white"
                }`}
              >
                <Icon name={DEPARTMENT_ICONS[d] ?? "stethoscope"} size={24} className={on ? "text-navy-700" : "text-green-600"} />
                <span className="min-w-0">
                  <span className="block text-[14.5px] leading-[1.3] font-bold">{d}</span>
                  <span className="mt-0.5 block text-[12.5px] text-ink-400">
                    {n} {n === 1 ? "doctor" : "doctors"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Doctor */}
      {dept && (
        <section className="mb-6 border-t border-line-100 pt-6">
          <h2 ref={doctorRef} tabIndex={-1} className="mb-3 text-[17px] font-bold outline-none">
            2. Choose a doctor
          </h2>
          <div className="flex flex-col gap-2.5">
            {deptDoctors.map((d) => {
              const on = doctorSlug === d.slug;
              return (
                <button
                  key={d.slug}
                  type="button"
                  aria-pressed={on}
                  onClick={() => pickDoctor(d.slug)}
                  className={`flex flex-wrap items-center gap-3.5 rounded-[12px] border p-4 text-left text-ink-900 transition-colors duration-[120ms] hover:border-navy-700 ${
                    on ? "border-navy-700 bg-navy-050" : "border-line-200 bg-white"
                  }`}
                >
                  <Avatar name={d.name} initials={d.initials} photo={d.photo} size={48} />
                  <span className="min-w-0 flex-[1_1_180px]">
                    <span className="block text-[15.5px] font-bold">{d.name}</span>
                    <span className="mt-0.5 block text-[13.5px] font-semibold text-green-600">{d.specialty}</span>
                  </span>
                  <span className="flex flex-[1_1_200px] gap-1.5" aria-label={`Clinic days: ${d.days.map((i) => DAY_NAMES[i]).join(", ")}`}>
                    {WEEK.map((w, i) => (
                      <span
                        key={w}
                        aria-hidden="true"
                        className={`min-w-0 flex-1 rounded-[7px] py-1.5 text-center text-xs ${
                          d.days.includes(i) ? "bg-navy-700 font-bold text-white" : "bg-line-050 font-semibold text-ink-300"
                        }`}
                      >
                        {w}
                      </span>
                    ))}
                  </span>
                  <span className="flex flex-none items-center gap-1.5 text-[13.5px] text-ink-700">
                    <Icon name="schedule" size={17} className="text-ink-400" />
                    {d.hours}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. Date */}
      {doctor && month && (
        <section className="mb-6 border-t border-line-100 pt-6">
          <div className="mb-1.5 flex flex-wrap items-baseline gap-2.5">
            <h2 ref={dateRef} tabIndex={-1} className="text-[17px] font-bold outline-none">
              3. Pick a date
            </h2>
            <span className="text-[13.5px] text-ink-400">
              {doctor.days.map((i) => DAY_NAMES[i]).join(", ")} · {doctor.hours}
            </span>
          </div>
          <p className="mb-3.5 text-[13.5px] text-ink-400">Greyed-out dates are outside this doctor&apos;s clinic days.</p>
          <Calendar doctor={doctor} month={month} setMonth={setMonth} selected={date} onPick={pickDate} />
        </section>
      )}

      {/* 4. Time */}
      {doctor && date && (
        <section className="mb-6 border-t border-line-100 pt-6">
          <div className="mb-3.5 flex flex-wrap items-baseline gap-2.5">
            <h2 ref={timeRef} tabIndex={-1} className="text-[17px] font-bold outline-none">
              4. Pick a time
            </h2>
            <span className="text-[13.5px] text-ink-400">{formatBookingDate(date)} · 20-minute slots</span>
          </div>
          {taken === null ? (
            <p className="text-[14.5px] text-ink-500" aria-live="polite">
              Checking available times…
            </p>
          ) : (
            <>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-[9px]">
                {clinicSlots(doctor.booking).map((t) => {
                  const isTaken = taken.includes(t);
                  const on = slot === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      disabled={isTaken}
                      aria-pressed={on}
                      aria-label={`${formatTime(t)}${isTaken ? ", already taken" : ""}`}
                      onClick={() => pickSlot(t)}
                      className={`rounded-button border py-3 text-center text-[14.5px] transition-colors duration-[120ms] ${
                        on
                          ? "border-navy-700 bg-navy-700 font-bold text-white"
                          : isTaken
                            ? "cursor-default border-line-050 bg-line-050 font-semibold text-ink-300 line-through"
                            : "border-line-300 bg-white font-bold text-navy-700 hover:border-navy-700"
                      }`}
                    >
                      {formatTime(t)}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3.5 flex flex-wrap gap-[18px] text-[12.5px] text-ink-400" aria-hidden="true">
                <span className="flex items-center gap-1.5">
                  <span className="size-[11px] rounded-[3px] border border-line-300 bg-white" />
                  Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-[11px] rounded-[3px] bg-navy-700" />
                  Selected
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-[11px] rounded-[3px] bg-line-050" />
                  Already taken
                </span>
              </div>
            </>
          )}
        </section>
      )}

      {/* Details */}
      {doctor && date && slot && (
        <DetailsForm
          headingRef={detailsRef}
          doctor={doctor}
          date={date}
          slot={slot}
          emergencyNumber={emergencyNumber}
          onChange={reset}
          onTaken={() => {
            setSlot(null);
            setTaken(null);
            fetchTakenSlots(doctor.slug, date).then(setTaken);
            focusSoon(timeRef);
          }}
        />
      )}
    </div>
  );
}

function Calendar({
  doctor,
  month,
  setMonth,
  selected,
  onPick,
}: {
  doctor: BookableDoctor;
  month: string;
  setMonth: (m: string) => void;
  selected: string | null;
  onPick: (day: string) => void;
}) {
  const today = manilaToday();
  const firstMonth = addDays(today, 1).slice(0, 7);
  const lastMonth = addDays(today, BOOKING_WINDOW_DAYS).slice(0, 7);
  const [y, m] = month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const leading = new Date(Date.UTC(y, m - 1, 1)).getUTCDay(); // 0 = Sunday
  const label = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, 1)),
  );
  const shift = (n: number) => {
    const d = new Date(Date.UTC(y, m - 1 + n, 1));
    setMonth(d.toISOString().slice(0, 7));
  };
  const days = Array.from({ length: daysInMonth }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`);
  const anyOpen = days.some((d) => isBookableDate(doctor, d, today));

  return (
    <div className="max-w-[420px]">
      <div className="mb-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => shift(-1)}
          disabled={month <= firstMonth}
          aria-label="Previous month"
          className="flex size-9 items-center justify-center rounded-button border border-line-300 text-navy-700 hover:border-navy-700 disabled:pointer-events-none disabled:opacity-50"
        >
          <Icon name="chevron_right" size={20} className="rotate-180" />
        </button>
        <span className="flex-1 text-center text-[15px] font-bold" aria-live="polite">
          {label}
        </span>
        <button
          type="button"
          onClick={() => shift(1)}
          disabled={month >= lastMonth}
          aria-label="Next month"
          className="flex size-9 items-center justify-center rounded-button border border-line-300 text-navy-700 hover:border-navy-700 disabled:pointer-events-none disabled:opacity-50"
        >
          <Icon name="chevron_right" size={20} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {DAY_HEADERS.map((h) => (
          <span key={h} aria-hidden="true" className="pb-1 text-center text-[11.5px] font-bold tracking-[0.6px] text-ink-400 uppercase">
            {h}
          </span>
        ))}
        {Array.from({ length: leading }, (_, i) => (
          <span key={`blank-${i}`} aria-hidden="true" />
        ))}
        {days.map((d) => {
          const open = isBookableDate(doctor, d, today);
          const on = selected === d;
          return (
            <button
              key={d}
              type="button"
              disabled={!open}
              aria-pressed={on}
              aria-label={`${formatBookingDate(d)}${open ? "" : ", not available"}`}
              onClick={() => onPick(d)}
              className={`rounded-input border py-[9px] text-center text-sm transition-colors duration-[120ms] ${
                on
                  ? "border-navy-700 bg-navy-700 font-bold text-white"
                  : open
                    ? "border-line-300 bg-white font-bold text-navy-700 hover:border-navy-700"
                    : "cursor-default border-transparent bg-transparent text-ink-300"
              }`}
            >
              {Number(d.slice(8))}
            </button>
          );
        })}
      </div>
      {!anyOpen && (
        <p className="mt-3 text-[13.5px] text-ink-500">No open clinic days this month — try the next month.</p>
      )}
    </div>
  );
}

function DetailsForm({
  headingRef,
  doctor,
  date,
  slot,
  emergencyNumber,
  onChange,
  onTaken,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  doctor: BookableDoctor;
  date: string;
  slot: string;
  emergencyNumber: string;
  onChange: () => void;
  onTaken: () => void;
}) {
  const [values, setValues] = useState<BookingDetails>({ name: "", mobile: "", philhealth: "", firstVisit: "yes", reason: "" });
  const [clientErrors, setClientErrors] = useState<BookingErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [state, formAction, pending] = useActionState<BookingState, FormData>(submitBooking, { status: "idle" });
  const [seen, setSeen] = useState<BookingState | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // A slot taken in the meantime sends the patient back to step 4 (once per response).
  const handled = useRef<BookingState | null>(null);
  useEffect(() => {
    if (state.status === "taken" && handled.current !== state) {
      handled.current = state;
      onTaken();
    }
  }, [state, onTaken]);

  const serverErrors = state.status === "invalid" && seen !== state ? state.errors : {};
  const errors: BookingErrors = { ...serverErrors, ...clientErrors };

  const update = (field: keyof BookingDetails, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    setSeen(state);
    if (attempted) setClientErrors(validateBookingDetails(next));
  };

  if (state.status === "sent") {
    return (
      <section role="status" className="border-t border-line-100 pt-6">
        <Icon name="check_circle" size={36} className="text-green-600" />
        <h2 className="mt-3 font-display text-[22px] font-bold nav:text-2xl">Request sent</h2>
        <p className="mt-2 max-w-[38em] text-[15px] leading-[1.6] text-ink-700">
          You asked for {doctor.name} on {formatBookingDate(date)} at {formatTime(slot)}. This is a request, not a
          confirmed booking — OPD staff will text you within one working day to confirm.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-button border border-line-300 px-[19px] py-[13px] text-[14.5px] font-bold text-ink-900 hover:border-navy-700 hover:text-navy-700"
        >
          Request another appointment
        </button>
      </section>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setAttempted(true);
        const found = validateBookingDetails(values);
        setClientErrors(found);
        const first = DETAIL_ORDER.find((f) => found[f]);
        if (first) {
          formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
          return;
        }
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
      className="border-t border-line-100 pt-6"
    >
      <h2 ref={headingRef} tabIndex={-1} className="mb-3.5 text-[17px] font-bold outline-none">
        Your details
      </h2>

      <input type="hidden" name="doctor" value={doctor.slug} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="time" value={slot} />

      <div className="mb-[18px] flex flex-wrap gap-x-[26px] gap-y-4 rounded-[12px] bg-navy-050 p-4">
        <SummaryItem icon="local_hospital" label="Department" value={doctor.group} />
        <SummaryItem icon="stethoscope" label="Doctor" value={doctor.name} />
        <SummaryItem icon="event_available" label="When" value={`${formatBookingDate(date)} · ${formatTime(slot)}`} />
        <button type="button" onClick={onChange} className="ml-auto self-center text-[13.5px] font-bold text-navy-700 hover:text-green-600">
          Change
        </button>
      </div>

      {(state.status === "error" || errors.slot) && (
        <p role="alert" className="mb-4 flex gap-2.5 rounded-input bg-red-050 px-3.5 py-3 text-[14.5px] leading-[1.5] text-red-700">
          <Icon name="error" size={20} />
          {errors.slot ?? "We couldn't send your request just now. Please try again, or call the trunkline."}
        </p>
      )}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 nav:gap-4">
        <Field prefix={P} id="name" label="Full name" error={errors.name}>
          <input
            {...fieldProps(P, "name", errors)}
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            autoComplete="name"
            placeholder="Juan dela Cruz"
            maxLength={100}
          />
        </Field>
        <Field prefix={P} id="mobile" label="Mobile number" error={errors.mobile}>
          <input
            {...fieldProps(P, "mobile", errors)}
            value={values.mobile}
            onChange={(e) => update("mobile", e.target.value)}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0917 000 0000"
          />
        </Field>
        <Field prefix={P} id="philhealth" label="PhilHealth number (optional)" error={errors.philhealth}>
          <input
            {...fieldProps(P, "philhealth", errors)}
            value={values.philhealth}
            onChange={(e) => update("philhealth", e.target.value)}
            inputMode="numeric"
            placeholder="00-000000000-0"
          />
        </Field>
        <Field prefix={P} id="firstVisit" label="Is this your first visit?" error={errors.firstVisit}>
          <div className="relative">
            <select
              {...fieldProps(P, "firstVisit", errors)}
              value={values.firstVisit}
              onChange={(e) => update("firstVisit", e.target.value)}
              className={`${inputClass(Boolean(errors.firstVisit))} w-full appearance-none pr-10`}
            >
              <option value="yes">Yes, first time at DCH</option>
              <option value="no">No, I have a patient record</option>
            </select>
            <Icon name="expand_more" size={20} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-500" />
          </div>
        </Field>
        <Field prefix={P} id="reason" label="Reason for visit" error={errors.reason} wide>
          <textarea
            {...fieldProps(P, "reason", errors)}
            value={values.reason}
            onChange={(e) => update("reason", e.target.value)}
            rows={3}
            maxLength={REASON_MAX}
            placeholder="Follow-up check-up, lab request, etc."
            className={`${inputClass(Boolean(errors.reason))} resize-y`}
          />
        </Field>
      </div>

      <Honeypot />

      <div className="mt-[22px] flex flex-wrap items-center gap-3.5">
        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-button bg-navy-700 px-6 py-3.5 text-[15.5px] font-bold text-white transition-colors duration-[120ms] hover:bg-navy-900 disabled:pointer-events-none disabled:opacity-50 nav:w-auto"
        >
          <Icon name="send" size={20} />
          {pending ? "Sending…" : "Request this slot"}
        </button>
        <span className="flex-[1_1_240px] text-[13.5px] leading-[1.5] text-ink-400">
          Slots are requests, not confirmations — OPD staff will text you within one working day. Not for emergencies;
          for urgent cases call{" "}
          <a href={telHref(emergencyNumber)} className="font-semibold text-ink-700 hover:text-navy-700">
            {emergencyNumber}
          </a>
          .
        </span>
      </div>
    </form>
  );
}

function SummaryItem({ icon, label, value }: { icon: "local_hospital" | "stethoscope" | "event_available"; label: string; value: string }) {
  return (
    <span className="flex items-start gap-[9px]">
      <Icon name={icon} size={19} className="text-navy-700" />
      <span>
        <span className="block text-[11.5px] font-bold tracking-[1px] text-ink-400 uppercase">{label}</span>
        <span className="mt-0.5 block text-[14.5px] font-semibold">{value}</span>
      </span>
    </span>
  );
}
