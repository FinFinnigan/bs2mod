export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid-products" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton-card" key={i}>
          <div className="skeleton skeleton-card__media" />
          <div className="skeleton skeleton-card__line" />
          <div className="skeleton skeleton-card__line short" />
        </div>
      ))}
    </div>
  );
}
