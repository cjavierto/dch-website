import config from "@payload-config";
import { getPayload } from "payload";
import { icsFile } from "@/lib/appointments";
import { calendarEvent, hospitalInfo } from "@/lib/appointmentEmails";
import { appointmentByToken } from "@/lib/appointmentsServer";

/** Calendar file (.ics) for Apple Calendar, Outlook and most phones. */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const a = await appointmentByToken((await params).token);
  if (!a) return new Response("Appointment not found", { status: 404 });
  const h = await hospitalInfo(await getPayload({ config }));
  const cancelled = a.status === "cancelled" || a.status === "declined";
  return new Response(icsFile({ ...calendarEvent(a, h), cancelled }), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="appointment.ics"',
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
