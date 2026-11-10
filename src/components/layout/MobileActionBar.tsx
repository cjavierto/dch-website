import Link from "next/link";
import { Icon } from "@/components/Icon";
import { telHref } from "@/lib/format";
import { routes } from "@/lib/routes";

/** Fixed Call Us / Book bar on phones. The root layout pads the page by
    --mobile-action-bar-h so it never covers the footer. */
export function MobileActionBar({ emergencyNumber }: { emergencyNumber: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2.5 border-t border-line-200 bg-white px-3.5 pt-2.5 pb-[max(10px,env(safe-area-inset-bottom))] nav:hidden">
      <a
        href={telHref(emergencyNumber)}
        aria-label={`Call us, ${emergencyNumber} (emergency room, open 24 hours)`}
        className="flex flex-1 items-center justify-center gap-[7px] rounded-button-lg bg-red-700 p-[13px] text-[14.5px] font-bold text-white hover:bg-red-800 hover:text-white"
      >
        <Icon name="call" size={19} />
        Call Us
      </a>
      <Link
        href={routes.book}
        className="flex flex-1 items-center justify-center gap-[7px] rounded-button-lg bg-navy-700 p-[13px] text-[14.5px] font-bold text-white hover:bg-navy-900 hover:text-white"
      >
        <Icon name="event_available" size={19} />
        Book
      </Link>
    </div>
  );
}
