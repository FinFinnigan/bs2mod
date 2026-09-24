"use client";

import Link from "next/link";

export function SizeGuideLink({ category }: { category: string }) {
  return (
    <Link href={`/size-guide?cat=${encodeURIComponent(category)}`} className="size-guide-link">
      Size guide
    </Link>
  );
}
