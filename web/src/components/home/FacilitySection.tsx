import Image from "next/image";
import { Icon } from "@/components/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { HomepageSettings } from "@/lib/types";

const highlights = [
  "PhilHealth, HMO, and senior/PWD discounts honored",
  "Ambulance service for barangay transfers",
  "On-site pharmacy open until 9:00 PM",
];

const photoSizes = "(min-width: 60rem) 600px, 100vw";
const smallPhotoSizes = "(min-width: 60rem) 300px, 50vw";

/** Shown until a photo is chosen in Admin → Settings → Homepage. */
const defaultPhotos = {
  large: { src: "/images/reception.png", alt: "Hospital reception" },
  left: { src: "/images/patient-room.png", alt: "Private patient room" },
  right: { src: "/images/imaging.png", alt: "CT scan suite" },
} satisfies HomepageSettings["facilityPhotos"];

export function FacilitySection({ photos }: { photos: HomepageSettings["facilityPhotos"] }) {
  const large = photos.large ?? defaultPhotos.large;
  const left = photos.left ?? defaultPhotos.left;
  const right = photos.right ?? defaultPhotos.right;

  return (
    <section aria-labelledby="facility-heading" className="page-container pt-[22px] nav:pt-2 nav:pb-6">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-center gap-[34px]">
        <div className="grid grid-cols-2 gap-3">
          <div className="relative col-span-full h-[210px] overflow-hidden rounded-card">
            <Image src={large.src} alt={large.alt} fill sizes={photoSizes} className="object-cover" />
          </div>
          <div className="relative h-[150px] overflow-hidden rounded-card">
            <Image src={left.src} alt={left.alt} fill sizes={smallPhotoSizes} className="object-cover" />
          </div>
          <div className="relative h-[150px] overflow-hidden rounded-card">
            <Image src={right.src} alt={right.alt} fill sizes={smallPhotoSizes} className="object-cover" />
          </div>
        </div>
        <div>
          <SectionHeading eyebrow="Our facility" id="facility-heading">
            Built for the community it serves
          </SectionHeading>
          <p className="mt-3.5 mb-[18px] text-[15px] leading-[1.65] text-ink-700 nav:text-base">
            Private and ward accommodations, a modern operating complex, and diagnostic equipment
            that means fewer trips to Cebu City for tests and follow-ups.
          </p>
          <ul className="flex flex-col gap-[11px]">
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-2.5 text-[15px] text-ink-900">
                <Icon name="check_circle" size={20} className="text-green-600" />
                {h}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
