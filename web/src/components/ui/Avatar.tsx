import Image from "next/image";

/** Round portrait, or initials on a navy tint when there is no photo. */
export function Avatar({
  name,
  initials,
  photo,
  size,
}: {
  name: string;
  initials: string;
  photo?: string;
  size: 44 | 48 | 52 | 58;
}) {
  const text = { 44: "text-base", 48: "text-[17px]", 52: "text-lg", 58: "text-xl" }[size];
  if (photo) {
    return (
      <Image
        src={photo}
        alt={name}
        width={size}
        height={size}
        className="flex-none rounded-full object-cover object-[center_18%]"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`flex flex-none items-center justify-center rounded-full bg-navy-075 font-bold text-navy-700 ${text}`}
      style={{ width: size, height: size }}
    >
      {initials}
    </span>
  );
}
