"use client";

import { startTransition, useActionState, useEffect, useMemo, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { Field, fieldProps, Honeypot, inputClass } from "@/components/ui/FormField";
import {
  DETAIL_ORDER,
  googleCalendarUrl,
  REASON_CHOICES,
  REASON_MAX,
  shortDate,
  slotEnd,
  validateAppointmentDetails,
  type AppointmentDetails,
  type AppointmentErrors,
} from "@/lib/appointments";
import { DEPARTMENT_ICONS, formatBookingDate, formatTime, SLOT_MINUTES, type BookableDoctor } from "@/lib/booking";
import { telHref } from "@/lib/format";
import { routes } from "@/lib/routes";
import { scheduleSummary } from "@/lib/schedule";
import { book, loadNextAvailable, type Booked, type BookState } from "./actions";
import { DayTimePicker } from "./DayTimePicker";

type Step = "doctor" | "time" | "details" | "done";
type Hospital = { name: string; place: string; location: string; emergencyNumber: string; trunkline: string };

/**
 * Self-service booking in three steps (doctor → day & time → details), with
 * a summary panel that fills in as the patient chooses. Books the slot
 * straight away; the confirmation email has a link to reschedule or cancel.
 */
export function Scheduler({
  doctors,
  groups,
  hospital,
  initialDoctor,
}: {
  doctors: BookableDoctor[];
  groups: string[];
  hospital: Hospital;
  /** From ?doctor=slug (the email's "Book another time", or a doctor's page). */
  initialDoctor?: string | null;
}) {
  const preset = initialDoctor && doctors.some((d) => d.slug === initialDoctor) ? initialDoctor : null;
  const [step, setStep] = useState<Step>(preset ? "time" : "doctor");
  const [doctorSlug, setDoctorSlug] = useState<string | null>(preset);
  const [slot, setSlot] = useState<{ day: string; time: string } | null>(null);
  const [booked, setBooked] = useState<Booked | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [next, setNext] = useState<Record<string, string | null> | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const doctor = doctors.find((d) => d.slug === doctorSlug) ?? null;

  useEffect(() => {
    loadNextAvailable().then(setNext);
  }, []);

  const go = (s: Step) => {
    setStep(s);
    setNotice(null);
    requestAnimationFrame(() => {
      headingRef.current?.focus({ preventScroll: true });
      const top = headingRef.current?.closest("section")?.getBoundingClientRect().top ?? 0;
      if (top < 0) headingRef.current?.closest("section")?.scrollIntoView({ block: "start" });
    });
  };

  const back = () => {
    if (step === "time") go("doctor");
    if (step === "details") go("time");
  };

  return (
    <section className="scroll-mt-24 overflow-hidden rounded-card-lg border border-line-200 bg-white nav:grid nav:min-h-[560px] nav:grid-cols-[300px_minmax(0,1fr)]">
      {/* Summary */}
      <aside className="border-b border-line-100 bg-paper/60 p-[18px] nav:border-r nav:border-b-0 nav:p-7" aria-label="Your appointment">
        {(step === "time" || step === "details") && (
          <button
            type="button"
            onClick={back}
            aria-label="Back"
            className="mb-4 flex size-10 items-center justify-center rounded-full border border-line-200 bg-white text-navy-700 hover:border-navy-700"
          >
            <Icon name="arrow_back" size={20} />
          </button>
        )}
        <p className="text-[13px] font-semibold text-ink-400">{hospital.name}</p>
        {doctor ? (
          <div className="mt-3 flex items-center gap-3">
            <Avatar name={doctor.name} initials={doctor.initials} photo={doctor.photo} size={52} />
            <div className="min-w-0">
              <p className="text-[17px] leading-[1.3] font-bold">{doctor.name}</p>
              <p className="text-[13.5px] font-semibold text-green-600">{doctor.specialty}</p>
            </div>
          </div>
        ) : (
          <p className="mt-1 font-display text-[22px] leading-[1.25] font-bold">Clinic appointment</p>
        )}
        <ul className="mt-5 flex flex-col gap-3 text-[14.5px] text-ink-700">
          <SummaryRow icon="schedule">{SLOT_MINUTES} minutes</SummaryRow>
          <SummaryRow icon="location_on">Outpatient Department, {hospital.place}</SummaryRow>
          {slot && (step === "details" || step === "done") && (
            <SummaryRow icon="calendar_month" strong>
              {formatTime(slot.time)} – {formatTime(slotEnd(slot.time))}
              <br />
              {formatBookingDate(slot.day)}
            </SummaryRow>
          )}
        </ul>
        {step !== "done" && (
          <ol className="mt-6 hidden gap-2 nav:flex nav:flex-col" aria-label="Steps">
            {(["doctor", "time", "details"] as const).map((s, i) => {
              const order = ["doctor", "time", "details"].indexOf(step);
              const done = i < order;
              const active = i === order;
              return (
                <li
                  key={s}
                  aria-current={active ? "step" : undefined}
                  className={`flex items-center gap-2.5 text-[13.5px] font-semibold ${active ? "text-navy-700" : done ? "text-green-900" : "text-ink-400"}`}
                >
                  <span
                    className={`flex size-6 items-center justify-center rounded-full text-[12px] font-bold ${
                      active ? "bg-navy-700 text-white" : done ? "bg-green-600 text-white" : "bg-line-100 text-ink-400"
                    }`}
                  >
                    {done ? <Icon name="check_circle" size={16} /> : i + 1}
                  </span>
                  {["Choose a doctor", "Pick a day and time", "Your details"][i]}
                </li>
              );
            })}
          </ol>
        )}
      </aside>

      {/* Current step */}
      <div className="p-[18px] nav:p-8">
        {notice && (
          <p role="alert" className="mb-4 flex gap-2.5 rounded-input bg-gold-050 px-3.5 py-3 text-[14.5px] leading-[1.5] text-ink-900">
            <Icon name="info" size={20} className="text-navy-700" />
            {notice}
          </p>
        )}

        {step === "doctor" && (
          <>
            <StepHeading ref={headingRef}>Who would you like to see?</StepHeading>
            <DoctorPicker
              doctors={doctors}
              groups={groups}
              next={next}
              onPick={(slug) => {
                setDoctorSlug(slug);
                setSlot(null);
                go("time");
              }}
            />
          </>
        )}

        {step === "time" && doctor && (
          <>
            <StepHeading ref={headingRef}>Pick a day and time</StepHeading>
            <p className="-mt-2 mb-5 text-[14px] text-ink-500">
              Highlighted days have free times. {scheduleSummary(doctor.schedule).join(" · ")}
            </p>
            <DayTimePicker
              key={doctor.slug}
              doctorSlug={doctor.slug}
              onPick={(day, time) => {
                setSlot({ day, time });
                go("details");
              }}
            />
          </>
        )}

        {step === "details" && doctor && slot && (
          <>
            <StepHeading ref={headingRef}>Your details</StepHeading>
            <DetailsForm
              doctor={doctor}
              slot={slot}
              emergencyNumber={hospital.emergencyNumber}
              onTaken={() => {
                setSlot(null);
                go("time");
                setNotice("Sorry, someone just booked that time. Please pick another.");
              }}
              onBooked={(b) => {
                setBooked(b);
                go("done");
              }}
            />
          </>
        )}

        {step === "done" && booked && doctor && (
          <Done booked={booked} doctor={doctor} hospital={hospital} headingRef={headingRef} />
        )}
      </div>
    </section>
  );
}

function SummaryRow({ icon, strong, children }: { icon: IconName; strong?: boolean; children: React.ReactNode }) {
  return (
    <li className={`flex gap-2.5 ${strong ? "font-bold text-ink-900" : ""}`}>
      <Icon name={icon} size={20} className={strong ? "text-green-600" : "text-ink-400"} />
      <span>{children}</span>
    </li>
  );
}

function StepHeading({ ref, children }: { ref: React.RefObject<HTMLHeadingElement | null>; children: React.ReactNode }) {
  return (
    <h2 ref={ref} tabIndex={-1} className="mb-4 font-display text-[21px] leading-[1.25] font-bold outline-none nav:text-[24px]">
      {children}
    </h2>
  );
}

// ---- Step 1: doctor ---------------------------------------------------------------------

function DoctorPicker({
  doctors,
  groups,
  next,
  onPick,
}: {
  doctors: BookableDoctor[];
  groups: string[];
  next: Record<string, string | null> | null;
  onPick: (slug: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string | null>(null);

  const shown = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return doctors.filter((d) => {
      if (group && d.group !== group) return false;
      const hay = `${d.name} ${d.specialty} ${d.group}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }, [doctors, query, group]);

  const chip = (on: boolean) =>
    `flex flex-none items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13.5px] font-semibold transition-colors duration-[120ms] ${
      on ? "border-navy-700 bg-navy-700 text-white" : "border-line-200 bg-white text-ink-700 hover:border-navy-700 hover:text-navy-700"
    }`;

  return (
    <div>
      <label className="relative block">
        <span className="sr-only">Search by doctor or specialty</span>
        <Icon name="search" size={21} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a doctor or specialty, e.g. pediatrics"
          className={`${inputClass(false)} w-full pl-11`}
        />
      </label>

      {groups.length > 1 && (
        <div
          role="group"
          aria-label="Department"
          className="-mx-[18px] mt-3 flex gap-2 overflow-x-auto px-[18px] pb-1 [scrollbar-width:none] nav:mx-0 nav:flex-wrap nav:overflow-visible nav:px-0 [&::-webkit-scrollbar]:hidden"
        >
          <button type="button" aria-pressed={group === null} onClick={() => setGroup(null)} className={chip(group === null)}>
            All doctors
          </button>
          {groups.map((g) => (
            <button key={g} type="button" aria-pressed={group === g} onClick={() => setGroup(group === g ? null : g)} className={chip(group === g)}>
              <Icon name={DEPARTMENT_ICONS[g] ?? "stethoscope"} size={17} />
              {g}
            </button>
          ))}
        </div>
      )}

      <ul className="mt-4 flex flex-col gap-2.5">
        {shown.map((d) => {
          const day = next?.[d.slug];
          return (
            <li key={d.slug}>
              <button
                type="button"
                onClick={() => onPick(d.slug)}
                className="group flex w-full items-center gap-3.5 rounded-[12px] border border-line-200 bg-white p-3.5 text-left text-ink-900 transition-colors duration-[120ms] hover:border-navy-700 hover:bg-navy-050/50 nav:p-4"
              >
                <Avatar name={d.name} initials={d.initials} photo={d.photo} size={52} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15.5px] leading-[1.3] font-bold">{d.name}</span>
                  <span className="block text-[13.5px] font-semibold text-green-600">{d.specialty}</span>
                  <span className="mt-1 block text-[13px] text-ink-500">{scheduleSummary(d.schedule).join(" · ")}</span>
                </span>
                <span className="hidden flex-none text-right nav:block">
                  {next === null ? (
                    <span className="text-[12.5px] text-ink-400">…</span>
                  ) : day ? (
                    <span className="rounded-full bg-green-050 px-2.5 py-1 text-[12.5px] font-bold text-green-900">Next: {shortDate(day)}</span>
                  ) : (
                    <span className="rounded-full bg-line-050 px-2.5 py-1 text-[12.5px] font-semibold text-ink-500">Fully booked</span>
                  )}
                </span>
                <Icon name="chevron_right" size={22} className="flex-none text-ink-300 group-hover:text-navy-700" />
              </button>
              {next !== null && (
                <p className="mt-1 pl-1 text-[12.5px] nav:hidden">
                  {day ? <span className="font-semibold text-green-900">Next free: {shortDate(day)}</span> : <span className="text-ink-500">Fully booked for now</span>}
                </p>
              )}
            </li>
          );
        })}
      </ul>
      {shown.length === 0 && (
        <p className="mt-4 rounded-input bg-paper px-4 py-3.5 text-[14.5px] text-ink-700">
          No doctor matches “{query}”. Try a specialty like “pediatrics”, or{" "}
          <button type="button" onClick={() => (setQuery(""), setGroup(null))} className="font-bold text-navy-700 underline">
            show all doctors
          </button>
          .
        </p>
      )}
    </div>
  );
}

// ---- Step 3: details -----------------------------------------------------------------------

function DetailsForm({
  doctor,
  slot,
  emergencyNumber,
  onTaken,
  onBooked,
}: {
  doctor: BookableDoctor;
  slot: { day: string; time: string };
  emergencyNumber: string;
  onTaken: () => void;
  onBooked: (b: Booked) => void;
}) {
  const P = "appt";
  const [values, setValues] = useState({ name: "", mobile: "", email: "", firstVisit: "", choice: "", more: "" });
  const [attempted, setAttempted] = useState(false);
  const [state, formAction, pending] = useActionState<BookState, FormData>(book, { status: "idle" });
  const [seen, setSeen] = useState<BookState | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const reason = [values.choice, values.more.trim()].filter(Boolean).join(": ");
  const details: AppointmentDetails = { name: values.name, mobile: values.mobile, email: values.email, firstVisit: values.firstVisit, reason };
  const clientErrors = attempted ? validateAppointmentDetails(details) : {};
  const serverErrors = state.status === "invalid" && seen !== state ? state.errors : {};
  const errors: AppointmentErrors = { ...serverErrors, ...clientErrors };

  const handled = useRef<BookState | null>(null);
  useEffect(() => {
    if (handled.current === state) return;
    handled.current = state;
    if (state.status === "taken") onTaken();
    if (state.status === "booked") onBooked(state.booked);
  }, [state, onTaken, onBooked]);

  const set = (k: keyof typeof values, v: string) => {
    setValues((prev) => ({ ...prev, [k]: v }));
    setSeen(state);
  };

  const toggle = (on: boolean) =>
    `flex-1 rounded-button border px-4 py-3 text-[15px] font-bold transition-colors duration-[120ms] ${
      on ? "border-navy-700 bg-navy-700 text-white" : "border-line-300 bg-white text-ink-900 hover:border-navy-700"
    }`;

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setAttempted(true);
        const found = validateAppointmentDetails(details);
        const first = DETAIL_ORDER.find((f) => found[f]);
        if (first) {
          formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus();
          return;
        }
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
    >
      <input type="hidden" name="doctor" value={doctor.slug} />
      <input type="hidden" name="date" value={slot.day} />
      <input type="hidden" name="time" value={slot.time} />
      <input type="hidden" name="reason" value={reason} />
      <input type="hidden" name="firstVisit" value={values.firstVisit} />

      {(state.status === "error" || errors.slot) && (
        <p role="alert" className="mb-4 flex gap-2.5 rounded-input bg-red-050 px-3.5 py-3 text-[14.5px] leading-[1.5] text-red-700">
          <Icon name="error" size={20} />
          {errors.slot ?? "We couldn't book that just now. Please try again, or call us."}
        </p>
      )}

      <div className="grid gap-4 nav:grid-cols-2">
        <Field prefix={P} id="name" label="Patient's full name" error={errors.name} wide>
          <input
            {...fieldProps(P, "name", errors)}
            data-field="name"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            autoComplete="name"
            placeholder="Juan dela Cruz"
            maxLength={100}
          />
        </Field>
        <Field prefix={P} id="mobile" label="Mobile number" error={errors.mobile}>
          <input
            {...fieldProps(P, "mobile", errors)}
            data-field="mobile"
            value={values.mobile}
            onChange={(e) => set("mobile", e.target.value)}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0917 000 0000"
          />
        </Field>
        <Field prefix={P} id="email" label="Email (for your confirmation)" error={errors.email}>
          <input
            {...fieldProps(P, "email", errors)}
            data-field="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="juan@gmail.com"
          />
        </Field>
      </div>

      <fieldset className="mt-5" aria-describedby={errors.firstVisit ? `${P}-firstVisit-error` : undefined}>
        <legend className="mb-2 text-[13.5px] font-semibold text-ink-700">Is this your first visit to our hospital?</legend>
        <div className="flex max-w-[360px] gap-2.5">
          <button type="button" data-field="firstVisit" aria-pressed={values.firstVisit === "yes"} onClick={() => set("firstVisit", "yes")} className={toggle(values.firstVisit === "yes")}>
            Yes, first visit
          </button>
          <button type="button" aria-pressed={values.firstVisit === "no"} onClick={() => set("firstVisit", "no")} className={toggle(values.firstVisit === "no")}>
            No, been here
          </button>
        </div>
        {errors.firstVisit && <ErrorLine id={`${P}-firstVisit-error`}>{errors.firstVisit}</ErrorLine>}
      </fieldset>

      <fieldset className="mt-5" aria-describedby={errors.reason ? `${P}-reason-error` : undefined}>
        <legend className="mb-2 text-[13.5px] font-semibold text-ink-700">What is the visit for?</legend>
        <div className="flex flex-wrap gap-2">
          {REASON_CHOICES.map((r, i) => {
            const on = values.choice === r;
            return (
              <button
                key={r}
                type="button"
                data-field={i === 0 ? "reason" : undefined}
                aria-pressed={on}
                onClick={() => set("choice", on ? "" : r)}
                className={`rounded-full border px-3.5 py-2 text-[14px] font-semibold transition-colors duration-[120ms] ${
                  on ? "border-navy-700 bg-navy-700 text-white" : "border-line-300 bg-white text-ink-700 hover:border-navy-700"
                }`}
              >
                {r}
              </button>
            );
          })}
        </div>
        <label htmlFor={`${P}-more`} className="mt-3 block text-[13px] text-ink-500">
          {values.choice ? "Anything the doctor should know? (optional)" : "Or tell us in your own words"}
        </label>
        <textarea
          id={`${P}-more`}
          value={values.more}
          onChange={(e) => set("more", e.target.value)}
          rows={2}
          maxLength={REASON_MAX - 40}
          placeholder="e.g. cough for a week, follow-up after surgery"
          className={`${inputClass(Boolean(errors.reason))} mt-1.5 w-full resize-y`}
        />
        {errors.reason && <ErrorLine id={`${P}-reason-error`}>{errors.reason}</ErrorLine>}
      </fieldset>

      <Honeypot />

      <button
        type="submit"
        disabled={pending}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-button bg-navy-700 px-6 py-4 text-[16px] font-bold text-white transition-colors duration-[120ms] hover:bg-navy-900 disabled:pointer-events-none disabled:opacity-60 nav:w-auto"
      >
        <Icon name="event_available" size={21} />
        {pending ? "Booking…" : `Book ${shortDate(slot.day)}, ${formatTime(slot.time)}`}
      </button>
      <p className="mt-3 text-[13px] leading-[1.5] text-ink-400">
        Not for emergencies. For urgent care call{" "}
        <a href={telHref(emergencyNumber)} className="font-semibold text-ink-700 hover:text-navy-700">
          {emergencyNumber}
        </a>{" "}
        or come to the Emergency Room, open 24 hours.
      </p>
    </form>
  );
}

function ErrorLine({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-[13px] leading-[1.45] text-red-700">
      <Icon name="error" size={17} className="mt-px" />
      {children}
    </p>
  );
}

// ---- Done ----------------------------------------------------------------------------------

function Done({
  booked,
  doctor,
  hospital,
  headingRef,
}: {
  booked: Booked;
  doctor: BookableDoctor;
  hospital: Hospital;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const google = googleCalendarUrl({
    day: booked.day,
    time: booked.time,
    title: `Appointment with ${doctor.name}`,
    details: `${doctor.specialty} at ${hospital.name}. Please arrive a few minutes early to register at the OPD.`,
    location: hospital.location,
  });
  const secondary =
    "flex items-center justify-center gap-2 rounded-button border border-line-300 bg-white px-4 py-3 text-[14.5px] font-bold text-navy-700 hover:border-navy-700";

  return (
    <div role="status">
      <span className="flex size-14 items-center justify-center rounded-full bg-green-050">
        <Icon name="check_circle" size={34} className="text-green-600" />
      </span>
      <h2 ref={headingRef} tabIndex={-1} className="mt-4 font-display text-[24px] leading-[1.25] font-bold outline-none nav:text-[28px]">
        You&apos;re booked!
      </h2>
      <p className="mt-2 text-[15.5px] leading-[1.6] text-ink-700">
        {doctor.name} on <strong>{formatBookingDate(booked.day)}</strong> at <strong>{formatTime(booked.time)}</strong>.
      </p>
      <p className="mt-1 text-[14.5px] leading-[1.6] text-ink-500">
        We sent the details to <strong className="text-ink-700">{booked.email}</strong>. Please arrive a few minutes early to register at the OPD.
      </p>

      <p className="mt-6 mb-2 text-[12px] font-bold tracking-[0.8px] text-ink-400 uppercase">Add to your calendar</p>
      <div className="grid gap-2.5 nav:max-w-[460px] nav:grid-cols-2">
        <a href={google} target="_blank" rel="noopener noreferrer" className={secondary}>
          <Icon name="calendar_month" size={19} />
          Google Calendar
        </a>
        <a href={`/book-appointment/calendar/${booked.token}`} className={secondary}>
          <Icon name="event_available" size={19} />
          Apple / Outlook
        </a>
      </div>

      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-line-100 pt-5 text-[14.5px]">
        <a href={routes.manageAppointment(booked.token)} className="font-bold text-navy-700 hover:text-green-600">
          Reschedule or cancel
        </a>
        <button type="button" onClick={() => window.location.assign(routes.bookAppointment)} className="font-bold text-navy-700 hover:text-green-600">
          Book another appointment
        </button>
      </div>
    </div>
  );
}
