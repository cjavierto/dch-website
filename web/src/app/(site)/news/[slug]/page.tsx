import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DetailFallback } from "@/components/DetailFallback";
import { ArticleLayout, RelatedLinks } from "@/components/ArticleLayout";
import type { IconName } from "@/components/Icon";
import { ButtonLink, NavyPanel } from "@/components/ui/Cards";
import { BodyPending, RichText } from "@/components/ui/RichText";
import { getNewsPost, getNewsPosts, getServices } from "@/lib/cms";
import { formatDate, formatDateLong, newsCategoryTag, readingMinutes } from "@/lib/format";
import { routes } from "@/lib/routes";

export async function generateStaticParams() {
  const posts = await getNewsPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/news/[slug]">): Promise<Metadata> {
  const post = await getNewsPost((await params).slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default function NewsPostPage({ params }: PageProps<"/news/[slug]">) {
  // Streamed so client navigations show the page frame immediately.
  return (
    <Suspense fallback={<DetailFallback />}>
      <NewsPostDetail params={params} />
    </Suspense>
  );
}

async function NewsPostDetail({ params }: { params: PageProps<"/news/[slug]">["params"] }) {
  const { slug } = await params;
  const [post, all, services] = await Promise.all([getNewsPost(slug), getNewsPosts(), getServices()]);
  if (!post) notFound();

  const service = services.find((s) => s.slug === post.relatedService);
  const related = [
    ...all.filter((p) => p.slug !== slug && p.category === post.category),
    ...all.filter((p) => p.slug !== slug && p.category !== post.category),
  ].slice(0, 3);

  const meta: { icon: IconName; text: string; dateTime?: string }[] = [
    { icon: "calendar_month", text: formatDateLong(post.publishedAt), dateTime: post.publishedAt },
  ];
  if (post.author) meta.push({ icon: "person", text: post.author });
  if (post.body.length > 0) meta.push({ icon: "schedule", text: `${readingMinutes(post.body)} min read` });

  return (
    <ArticleLayout
      crumb={{ label: "News & Announcements", href: routes.news }}
      category={newsCategoryTag(post.category)}
      title={post.title}
      meta={meta}
      cover={post.cover}
      coverCaption={post.coverCaption}
      aside={
        <>
          <RelatedLinks
            title="Related updates"
            items={related.map((r) => ({ href: routes.newsPost(r.slug), title: r.title, meta: formatDate(r.publishedAt) }))}
          />
          {post.sidebarCta ? (
            <NavyPanel icon="event_available" title={post.sidebarCta.title} link={{ href: post.sidebarCta.href, label: post.sidebarCta.label }}>
              {post.sidebarCta.text}
            </NavyPanel>
          ) : (
            <NavyPanel icon="mail" title="Questions about this update?" link={{ href: routes.contact, label: "Send us a message" }}>
              Our staff reply within one working day.
            </NavyPanel>
          )}
        </>
      }
    >
      {post.body.length > 0 ? (
        <RichText blocks={post.body} />
      ) : (
        <>
          <p className="mb-5 text-[17px] leading-[1.65] font-medium text-ink-900 nav:text-[19px]">{post.excerpt}</p>
          <BodyPending what="announcement" />
        </>
      )}
      <div className="mt-7 flex flex-wrap gap-3 border-t border-line-200 pt-6">
        {service && (
          <ButtonLink href={routes.service(service.slug)} icon={service.icon}>
            {service.name} department
          </ButtonLink>
        )}
        <ButtonLink href={routes.news} variant="outline" icon="arrow_back">
          Back to all news
        </ButtonLink>
      </div>
    </ArticleLayout>
  );
}
