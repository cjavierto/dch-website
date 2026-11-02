/**
 * Feature flags. NEXT_PUBLIC_* values are inlined at build time, so set them
 * in the environment of the machine that runs `npm run build` (for Namecheap,
 * your computer before `npm run package:namecheap`), not only on the server.
 */

/** Online appointment booking (/book). Off by default for launch — while it
    is off, every "Book Appointment" CTA goes to the contact form instead and
    the admin hides Booking requests. */
export const BOOKING_ENABLED = process.env.NEXT_PUBLIC_BOOKING_ENABLED === "true";
