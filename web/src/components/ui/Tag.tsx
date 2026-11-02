import type { Tag as TagData } from "@/lib/types";

const tones: Record<TagData["tone"], string> = {
  info: "bg-navy-050 text-navy-700",
  success: "bg-green-050 text-green-600",
  notice: "bg-gold-050 text-gold-800",
  danger: "bg-red-050 text-red-700",
};

export function Tag({ label, tone, upper }: TagData & { upper?: boolean }) {
  return (
    <span
      className={`inline-block rounded-tag px-[9px] py-[5px] text-[11.5px] font-bold nav:px-2.5 nav:text-[12.5px] ${tones[tone]} ${
        upper ? "rounded-[5px] !text-xs uppercase nav:px-[9px] nav:py-1" : ""
      }`}
    >
      {label}
    </span>
  );
}

export function TagList({ tags }: { tags: TagData[] }) {
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-[7px] nav:gap-2">
      {tags.map((t) => (
        <Tag key={t.label} {...t} />
      ))}
    </div>
  );
}
