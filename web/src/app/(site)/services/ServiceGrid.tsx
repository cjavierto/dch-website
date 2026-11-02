"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { FilterChips } from "@/components/ui/FilterChips";
import { TagList } from "@/components/ui/Tag";
import { routes } from "@/lib/routes";
import { SERVICE_CATEGORIES, type Service, type ServiceCategory } from "@/lib/types";

export function ServiceGrid({ services }: { services: Service[] }) {
  const [category, setCategory] = useState<ServiceCategory | null>(null);
  const shown = category ? services.filter((s) => s.categories.includes(category)) : services;

  return (
    <>
      <div className="mb-4 nav:mb-7">
        <FilterChips label="Filter departments" options={SERVICE_CATEGORIES} value={category} onChange={setCategory} />
      </div>
      <p className="sr-only" aria-live="polite">
        Showing {shown.length} departments
      </p>
      <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-3.5 nav:gap-5">
        {shown.map((s) => (
          <li key={s.slug}>
            <Link
              href={routes.service(s.slug)}
              className="flex h-full flex-col overflow-hidden rounded-card-lg border border-line-200 bg-white text-ink-900 hover:border-navy-700 hover:text-ink-900"
            >
              {s.image && (
                <div className="relative h-[150px] nav:h-[176px]">
                  <Image src={s.image.src} alt="" fill sizes="(min-width: 60rem) 400px, 100vw" className="object-cover" />
                </div>
              )}
              <div className="flex flex-1 flex-col p-4 nav:p-[22px]">
                <div className="mb-[7px] flex items-center gap-2 nav:mb-2.5 nav:gap-[9px]">
                  <Icon name={s.icon} size={24} className={s.emergency ? "text-red-700" : "text-navy-700"} />
                  <h2 className="text-[17px] font-bold nav:text-[19px]">{s.name}</h2>
                </div>
                <p className="mb-2.5 text-sm leading-[1.55] text-ink-500 nav:mb-3.5 nav:text-[14.5px] nav:leading-[1.6]">{s.summary}</p>
                <div className="mt-auto">
                  <TagList tags={s.tags} />
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
