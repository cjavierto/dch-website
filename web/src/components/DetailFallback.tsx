/**
 * Placeholder for detail pages (service, news, article, job) while their
 * content streams in on a client navigation. Deliberately still: a plain
 * navy band where the page header will be — no shimmer or animation.
 */
export function DetailFallback() {
  return (
    <div aria-busy="true" aria-label="Loading page">
      <div className="h-[200px] bg-navy-900 nav:h-[300px]" />
      <div className="h-[50vh]" />
    </div>
  );
}
