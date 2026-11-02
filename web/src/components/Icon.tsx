/**
 * Material Symbols Rounded (filled). The font is subset to ICON_NAMES in the
 * root layout, so an icon must be listed here before it can render — TypeScript
 * enforces that through IconName.
 */
export const ICON_NAMES = [
  "add",
  "apartment",
  "arrow_back",
  "arrow_forward",
  "assignment",
  "badge",
  "balance",
  "bed",
  "calendar_month",
  "call",
  "campaign",
  "cardiology",
  "chat",
  "check_circle",
  "chevron_right",
  "child_care",
  "close",
  "emergency",
  "error",
  "event_available",
  "expand_more",
  "favorite",
  "filter_list",
  "flag",
  "groups",
  "handshake",
  "home",
  "info",
  "labs",
  "local_hospital",
  "location_on",
  "lock",
  "looks_3",
  "looks_4",
  "looks_one",
  "looks_two",
  "mail",
  "map",
  "medication",
  "meeting_room",
  "menu",
  "menu_book",
  "monitor_heart",
  "payments",
  "person",
  "pregnant_woman",
  "public",
  "radiology",
  "receipt_long",
  "remove",
  "route",
  "schedule",
  "science",
  "search",
  "send",
  "shield",
  "stethoscope",
  "support_agent",
  "surgical",
  "upload_file",
  "vaccines",
  "verified",
  "visibility",
  "volunteer_activism",
  "work",
  "workspace_premium",
] as const;

export type IconName = (typeof ICON_NAMES)[number];

export const ICON_FONT_URL =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0" +
  `&icon_names=${[...ICON_NAMES].sort().join(",")}&display=block`;

type IconProps = {
  name: IconName;
  /** Pixel size. */
  size: number;
  className?: string;
  /** Leave unset for decorative icons next to a text label. */
  label?: string;
};

export function Icon({ name, size, className = "", label }: IconProps) {
  return (
    <span
      className={`ms ${className}`}
      style={{ fontSize: size, width: size, height: size, overflow: "hidden" }}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      {name}
    </span>
  );
}
