/**
 * Material Symbols Rounded (filled) for the admin dashboard, loaded by the
 * admin layout and subset to these names. Add a name here before using it —
 * TypeScript enforces that through AdminIconName.
 */
export const ADMIN_ICON_NAMES = [
  "article",
  "assignment_ind",
  "badge",
  "campaign",
  "chevron_right",
  "date_range",
  "description",
  "event_available",
  "flag",
  "gavel",
  "groups",
  "history",
  "home",
  "info",
  "mail",
  "manage_accounts",
  "mark_email_read",
  "mark_email_unread",
  "medical_services",
  "person_add",
  "personal_injury",
  "photo_library",
  "quiz",
  "settings",
  "stethoscope",
  "upload",
  "visibility",
  "work",
] as const;

export type AdminIconName = (typeof ADMIN_ICON_NAMES)[number];

/** Google requires icon_names in alphabetical order. */
export const ADMIN_ICON_FONT_URL =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400,1,0" +
  `&icon_names=${[...ADMIN_ICON_NAMES].sort().join(",")}&display=block`;
