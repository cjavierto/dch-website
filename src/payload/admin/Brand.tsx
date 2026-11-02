/* eslint-disable @next/next/no-img-element -- Payload renders these outside next/image's config. */

/** Login screen logo. */
export function Logo() {
  return (
    <div className="dch-brand">
      <img src="/images/dch-logo.jpg" alt="" width={56} height={56} className="dch-brand__mark" />
      <span className="dch-brand__text">
        <span className="dch-brand__name">DCH Admin</span>
        <span className="dch-brand__sub">Deiparine Community Hospital · Website manager</span>
      </span>
    </div>
  );
}

/** Sidebar / nav mark. */
export function Icon() {
  return <img src="/images/dch-logo.jpg" alt="DCH" width={32} height={32} className="dch-brand__mark" />;
}
