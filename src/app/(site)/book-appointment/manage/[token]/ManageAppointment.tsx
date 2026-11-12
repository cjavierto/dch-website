"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/Icon";
import { shortDate, slotEnd, type AppointmentStatus } from "@/lib/appointments";
import { formatBookingDate, formatTime } from "@/lib/booking";
import { telHref } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cancel, reschedule } from "../../actions";
import { DayTimePicker } from "../../DayTimePicker";

type Appointment = {
  token: string;
  status: AppointmentStatus;
  doctorSlug: string;
  doctorName: string;
  specialty: string;
  day: string;
  time: string;
  name: string;
};

type Mode = "view" | "pick" | "confirmMove" | "confirmCancel";

const primary =
  "flex items-center justify-center gap-2 rounded-button bg-navy-700 px-5 py-3.5 text-[15px] font-bold text-white hover:bg-navy-900 disabled:pointer-events-none disabled:opacity-60";
const secondary =
  "flex items-center justify-center gap-2 rounded-button border border-line-300 bg-white px-5 py-3.5 text-[15px] font-bold text-ink-900 hover:border-navy-700 hover:text-navy-700 disabled:pointer-events-none disabled:opacity-60";
const danger =
  "flex items-center justify-center gap-2 rounded-button bg-red-700 px-5 py-3.5 text-[15px] font-bold text-white hover:bg-red-800 disabled:pointer-events-none disabled:opacity-60";

export function ManageAppointment({
  appointment,
  changeable,
  place,
  trunkline,
}: {
  appointment: Appointment;
  changeable: boolean;
  place: string;
  trunkline: string;
}) {
  const [a, setA] = useState(appointment);
  const [canChange, setCanChange] = useState(changeable);
  const [mode, setMode] = useState<Mode>("view");
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);
  const [newSlot, setNewSlot] = useState<{ day: string; time: string } | null>(null);

  const cancelled = a.status === "cancelled" || a.status === "declined";
  const failed = (r: string) =>
    setNotice({
      tone: "warn",
      text:
        r === "locked"
          ? `This appointment can't be changed online any more. Please call ${trunkline}.`
          : `Something went wrong. Please try again, or call ${trunkline}.`,
    });

  const doCancel = () =>
    startTransition(async () => {
      const r = await cancel(a.token);
      if (r === "cancelled") {
        setA({ ...a, status: "cancelled" });
        setCanChange(false);
        setMode("view");
        setNotice({ tone: "ok", text: "Your appointment is cancelled. We emailed you a confirmation." });
      } else failed(r);
    });

  const doMove = () =>
    startTransition(async () => {
      if (!newSlot) return;
      const r = await reschedule(a.token, newSlot.day, newSlot.time);
      if (r === "moved") {
        setA({ ...a, ...newSlot, status: "confirmed" });
        setMode("view");
        setNotice({ tone: "ok", text: "Done! Your appointment is moved. We emailed you the new details." });
      } else if (r === "taken") {
        setMode("pick");
        setNotice({ tone: "warn", text: "Sorry, someone just booked that time. Please pick another." });
      } else failed(r);
    });

  return (
    <div className="overflow-hidden rounded-card-lg border border-line-200 bg-white">
      {/* Appointment card */}
      <div className="flex flex-wrap items-start gap-4 border-b border-line-100 bg-paper/60 p-[18px] nav:p-7">
        <span className={`flex size-12 flex-none items-center justify-center rounded-full ${cancelled ? "bg-line-100" : "bg-green-050"}`}>
          <Icon name={cancelled ? "close" : "event_available"} size={26} className={cancelled ? "text-ink-500" : "text-green-600"} />
        </span>
        <div className="min-w-0 flex-1">
          <p className={`text-[12.5px] font-bold tracking-[0.8px] uppercase ${cancelled ? "text-red-700" : "text-green-900"}`}>
            {cancelled ? "Cancelled" : a.status === "requested" ? "Requested" : canChange ? "Booked" : "Past appointment"}
          </p>
          <p className={`mt-1 font-display text-[21px] leading-[1.3] font-bold nav:text-[24px] ${cancelled ? "text-ink-500 line-through" : ""}`}>
            {formatBookingDate(a.day)}
            <br />
            {formatTime(a.time)} – {formatTime(slotEnd(a.time))}
          </p>
          <p className="mt-2 text-[15px] text-ink-700">
            <strong>{a.doctorName}</strong> · {a.specialty}
          </p>
          <p className="mt-0.5 text-[14px] text-ink-500">
            {place} · for {a.name}
          </p>
        </div>
      </div>

      <div className="p-[18px] nav:p-7">
        {notice && (
          <p
            role="status"
            className={`mb-5 flex gap-2.5 rounded-input px-3.5 py-3 text-[14.5px] leading-[1.5] ${
              notice.tone === "ok" ? "bg-green-050 text-green-900" : "bg-gold-050 text-ink-900"
            }`}
          >
            <Icon name={notice.tone === "ok" ? "check_circle" : "info"} size={20} />
            {notice.text}
          </p>
        )}

        {mode === "view" && canChange && (
          <div className="flex flex-col gap-2.5 nav:flex-row">
            <button type="button" onClick={() => (setNotice(null), setMode("pick"))} className={primary}>
              <Icon name="calendar_month" size={20} />
              Reschedule
            </button>
            <a href={`/book-appointment/calendar/${a.token}`} className={secondary}>
              <Icon name="event_available" size={20} />
              Add to calendar
            </a>
            <button type="button" onClick={() => (setNotice(null), setMode("confirmCancel"))} className={`${secondary} nav:ml-auto`}>
              <Icon name="close" size={20} />
              Cancel appointment
            </button>
          </div>
        )}

        {mode === "view" && !canChange && (
          <div className="flex flex-col gap-2.5 nav:flex-row">
            <a href={`${routes.bookAppointment}?doctor=${encodeURIComponent(a.doctorSlug)}`} className={primary}>
              <Icon name="event_available" size={20} />
              Book {cancelled ? "another time" : "a new appointment"}
            </a>
            <a href={telHref(trunkline)} className={secondary}>
              <Icon name="call" size={20} />
              Call {trunkline}
            </a>
          </div>
        )}

        {mode === "confirmCancel" && (
          <div>
            <h2 className="text-[18px] font-bold">Cancel this appointment?</h2>
            <p className="mt-1.5 text-[14.5px] text-ink-700">The time will be given to another patient. You can book again any time.</p>
            <div className="mt-4 flex flex-col gap-2.5 nav:flex-row">
              <button type="button" onClick={doCancel} disabled={pending} className={danger}>
                {pending ? "Cancelling…" : "Yes, cancel it"}
              </button>
              <button type="button" onClick={() => setMode("view")} disabled={pending} className={secondary}>
                No, keep it
              </button>
            </div>
          </div>
        )}

        {mode === "pick" && (
          <div>
            <div className="mb-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => (setNotice(null), setMode("view"))}
                aria-label="Back"
                className="flex size-10 flex-none items-center justify-center rounded-full border border-line-200 text-navy-700 hover:border-navy-700"
              >
                <Icon name="arrow_back" size={20} />
              </button>
              <h2 className="font-display text-[20px] font-bold nav:text-[22px]">Pick a new day and time</h2>
            </div>
            <DayTimePicker
              doctorSlug={a.doctorSlug}
              current={{ day: a.day, time: a.time }}
              onPick={(day, time) => {
                setNewSlot({ day, time });
                setNotice(null);
                setMode("confirmMove");
              }}
            />
          </div>
        )}

        {mode === "confirmMove" && newSlot && (
          <div>
            <h2 className="text-[18px] font-bold">Move your appointment?</h2>
            <div className="mt-3 grid max-w-[520px] gap-2 text-[15px] nav:grid-cols-[60px_1fr]">
              <span className="text-ink-400">From</span>
              <span className="text-ink-500 line-through">
                {shortDate(a.day)}, {formatTime(a.time)}
              </span>
              <span className="text-ink-400">To</span>
              <span className="font-bold">
                {formatBookingDate(newSlot.day)}, {formatTime(newSlot.time)}
              </span>
            </div>
            <div className="mt-5 flex flex-col gap-2.5 nav:flex-row">
              <button type="button" onClick={doMove} disabled={pending} className={primary}>
                {pending ? "Moving…" : "Yes, move it"}
              </button>
              <button type="button" onClick={() => setMode("pick")} disabled={pending} className={secondary}>
                Pick another time
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
