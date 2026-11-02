import { ButtonLink } from "@/components/ui/Cards";
import { routes } from "@/lib/routes";

export default function NotFound() {
  return (
    <section className="page-container flex flex-col items-start gap-4 py-14 nav:py-24">
      <span className="eyebrow">Page not found</span>
      <h1 className="font-display text-[27px] font-bold tracking-[-0.5px] text-ink-900 nav:text-[44px] nav:tracking-[-0.8px]">
        We couldn&apos;t find that page.
      </h1>
      <p className="max-w-[38em] text-base leading-[1.7] text-ink-700">
        It may have moved, or it is not published yet. For anything urgent, use the emergency number at the top of every
        page.
      </p>
      <div className="mt-2 flex flex-wrap gap-3">
        <ButtonLink href={routes.home} icon="home">
          Go to the homepage
        </ButtonLink>
        <ButtonLink href={routes.contact} variant="outline" icon="mail">
          Contact us
        </ButtonLink>
      </div>
    </section>
  );
}
