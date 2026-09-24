import Link from "next/link";
import { STORY_BAND } from "@/lib/data/site";
import { Breadcrumb } from "@/components/product/Breadcrumb";

export default function StoryPage() {
  return (
    <div className="container" style={{ paddingTop: "var(--space-3)", maxWidth: 720 }}>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Our story" }]} />
      <p className="eyebrow">{STORY_BAND.eyebrow}</p>
      <h1 className="display" style={{ marginTop: 8 }}>
        {STORY_BAND.headline}
      </h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: "var(--space-6)", color: "var(--color-ink-muted)", fontSize: "var(--fs-body-lg)", lineHeight: 1.7 }}>
        <p>{STORY_BAND.body}</p>
        <p>
          We make clothes for the space between &ldquo;school run&rdquo; and &ldquo;playground&rdquo; — pieces
          that survive knees, mud and the washing machine, and still look good enough for the
          family photo.
        </p>
        <p>
          Every garment uses hard-wearing, easy-care fabrics, reinforced seams and fits that
          grow with them. Fewer, better things — made to be handed down.
        </p>
      </div>
      <Link href="/collection/new-arrivals" className="btn btn-primary" style={{ marginTop: "var(--space-8)" }}>
        Shop the collection →
      </Link>
    </div>
  );
}
