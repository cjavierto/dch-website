import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DetailFallback } from "@/components/DetailFallback";
import { Icon, type IconName } from "@/components/Icon";
import { Panel } from "@/components/ui/Cards";
import { getJobPosting, getJobPostings, getSiteSettings } from "@/lib/cms";
import { routes } from "@/lib/routes";
import { ApplyForm } from "./ApplyForm";

export async function generateStaticParams() {
  const { jobs } = await getJobPostings();
  return jobs.map((j) => ({ slug: j.slug }));
}

export async function generateMetadata({ params }: PageProps<"/careers/[slug]">): Promise<Metadata> {
  const job = await getJobPosting((await params).slug);
  if (!job) return {};
  return { title: job.title, description: `${job.title} — ${job.department}, ${job.location}.` };
}

const STEP_ICONS: IconName[] = ["looks_one", "looks_two", "looks_3", "looks_4"];

export default function JobPage({ params }: PageProps<"/careers/[slug]">) {
  // Streamed so client navigations show the page frame immediately.
  return (
    <Suspense fallback={<DetailFallback />}>
      <JobDetail params={params} />
    </Suspense>
  );
}

async function JobDetail({ params }: { params: PageProps<"/careers/[slug]">["params"] }) {
  const { slug } = await params;
  const [job, settings] = await Promise.all([getJobPosting(slug), getSiteSettings()]);
  if (!job) notFound();

  const hasDetail = Boolean(job.role || job.duties || job.requirements);

  return (
    <>
      <section className="on-navy bg-navy-900">
        <div className="page-container pt-5 pb-[22px] nav:py-[52px]">
          <nav aria-label="Breadcrumb" className="mb-2 text-xs text-on-navy-muted nav:mb-2.5 nav:text-[13.5px]">
            <Link href={routes.careers} className="text-on-navy-muted hover:text-white">
              Careers
            </Link>{" "}
            / <span aria-current="page">{job.title}</span>
          </nav>
          <h1 className="font-display text-[27px] leading-[1.15] font-bold tracking-[-0.5px] text-white nav:text-[42px] nav:tracking-[-0.8px]">
            {job.title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-2.5 nav:mt-[18px]">
            <span className="rounded-full bg-white/12 px-3.5 py-2 text-[13px] font-semibold text-white nav:text-[13.5px]">
              {job.department}
            </span>
            <span className="rounded-full bg-white/12 px-3.5 py-2 text-[13px] font-semibold text-white nav:text-[13.5px]">
              {job.employmentType}
              {job.shift && ` · ${job.shift}`}
            </span>
            {job.openings && (
              <span className="rounded-full bg-gold-500/20 px-3.5 py-2 text-[13px] font-bold text-gold-300 nav:text-[13.5px]">
                {job.openings} {job.openings === 1 ? "opening" : "openings"}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="page-container grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-start gap-3 pt-[18px] pb-8 nav:gap-8 nav:pt-11 nav:pb-[72px]">
        <article className="rounded-card-lg border border-line-200 bg-white p-[18px] nav:p-[30px]">
          {hasDetail ? (
            <>
              {job.role && (
                <>
                  <h2 className="mb-2.5 font-display text-[22px] font-bold nav:text-2xl">The role</h2>
                  <p className="mb-[22px] text-[15.5px] leading-[1.7] text-ink-700 nav:text-base">{job.role}</p>
                </>
              )}
              <JobList title="What you will do" items={job.duties} />
              <JobList title="What we are looking for" items={job.requirements} />
              {job.compensation && (
                <>
                  <h3 className="mb-3 text-lg font-bold nav:text-[19px]">Compensation &amp; benefits</h3>
                  <p className="text-[15.5px] leading-[1.7] text-ink-700 nav:text-base">{job.compensation}</p>
                </>
              )}
            </>
          ) : (
            <>
              <h2 className="mb-2.5 font-display text-[22px] font-bold nav:text-2xl">The role</h2>
              <p className="text-[15.5px] leading-[1.7] text-ink-700 nav:text-base">
                {job.employmentType} position in {job.department}, based in {job.location}. The full description is being
                prepared — apply with your CV now, or email{" "}
                <a href={`mailto:${settings.careersEmail}`} className="font-semibold">
                  {settings.careersEmail}
                </a>{" "}
                with questions.
              </p>
            </>
          )}
        </article>

        <aside className="flex flex-col gap-3 nav:gap-[18px]">
          <Panel className="relative">
            <ApplyForm jobSlug={job.slug} licensed={job.licensed} />
          </Panel>
          {job.process && (
            <Panel>
              <h2 className="mb-3 text-[17px] font-bold">Hiring process</h2>
              <ol className="flex flex-col gap-3 text-[14.5px] text-ink-700">
                {job.process.map((step, i) => (
                  <li key={step} className="flex gap-2.5">
                    <Icon name={STEP_ICONS[i] ?? "check_circle"} size={19} className="text-green-600" />
                    {step}
                  </li>
                ))}
              </ol>
            </Panel>
          )}
          <Link href={routes.careers} className="inline-flex items-center gap-[7px] text-[15px] font-bold">
            <Icon name="arrow_back" size={19} />
            All open positions
          </Link>
        </aside>
      </section>
    </>
  );
}

function JobList({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <>
      <h3 className="mb-3 text-lg font-bold nav:text-[19px]">{title}</h3>
      <ul className="mb-6 flex list-disc flex-col gap-[9px] pl-[22px] text-[15.5px] leading-[1.7] text-ink-700 nav:text-base">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </>
  );
}
