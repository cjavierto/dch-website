import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DetailFallback } from "@/components/DetailFallback";
import { ArticleLayout, RelatedLinks } from "@/components/ArticleLayout";
import type { IconName } from "@/components/Icon";
import { ButtonLink, EmergencyCard } from "@/components/ui/Cards";
import { HealthDisclaimer } from "@/components/ui/HealthDisclaimer";
import { BodyPending, RichText } from "@/components/ui/RichText";
import { getArticle, getArticles, getSiteSettings } from "@/lib/cms";
import { articleCategoryLabel, readingMinutes } from "@/lib/format";
import { routes } from "@/lib/routes";

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/health-information/[slug]">): Promise<Metadata> {
  const article = await getArticle((await params).slug);
  if (!article) return {};
  return { title: article.title, description: article.excerpt };
}

export default function ArticlePage({ params }: PageProps<"/health-information/[slug]">) {
  // Streamed so client navigations show the page frame immediately.
  return (
    <Suspense fallback={<DetailFallback />}>
      <ArticleDetail params={params} />
    </Suspense>
  );
}

async function ArticleDetail({ params }: { params: PageProps<"/health-information/[slug]">["params"] }) {
  const { slug } = await params;
  const [article, all, settings] = await Promise.all([getArticle(slug), getArticles(), getSiteSettings()]);
  if (!article) notFound();

  const related = [
    ...all.filter((a) => a.slug !== slug && a.category === article.category),
    ...all.filter((a) => a.slug !== slug && a.category !== article.category),
  ].slice(0, 3);

  const meta: { icon: IconName; text: string }[] = [{ icon: "person", text: article.author }];
  if (article.body.length > 0) meta.push({ icon: "schedule", text: `${readingMinutes(article.body)} min read` });

  return (
    <ArticleLayout
      crumb={{ label: "Health Information", href: routes.health }}
      category={articleCategoryLabel(article.category)}
      title={article.title}
      meta={meta}
      cover={{ src: article.cover.src, alt: article.cover.alt }}
      aside={
        <>
          <RelatedLinks
            title="More health guides"
            items={related.map((r) => ({
              href: routes.healthArticle(r.slug),
              title: r.title,
              meta: articleCategoryLabel(r.category),
            }))}
          />
          <EmergencyCard
            title="If it cannot wait"
            text="Go straight to the ER — no appointment needed."
            emergencyNumber={settings.emergencyNumber}
          />
        </>
      }
    >
      {article.body.length > 0 ? (
        <RichText blocks={article.body} />
      ) : (
        <>
          <p className="mb-5 text-[17px] leading-[1.65] font-medium text-ink-900 nav:text-[19px]">{article.excerpt}</p>
          <BodyPending what="guide" />
        </>
      )}
      <div className="mt-7">
        <HealthDisclaimer emergencyNumber={settings.emergencyNumber} />
      </div>
      <div className="mt-6">
        <ButtonLink href={routes.health} variant="outline" icon="arrow_back">
          All health guides
        </ButtonLink>
      </div>
    </ArticleLayout>
  );
}
