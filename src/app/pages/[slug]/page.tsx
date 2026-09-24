import { notFound } from "next/navigation";
import { POLICIES } from "@/lib/data/site";
import { Breadcrumb } from "@/components/product/Breadcrumb";

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const policy = POLICIES[slug];
  if (!policy) notFound();

  return (
    <div className="container" style={{ paddingTop: "var(--space-3)", maxWidth: 720 }}>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: policy.title }]} />
      <h1>{policy.title}</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: "var(--space-6)", color: "var(--color-ink-muted)", fontSize: "var(--fs-body-lg)" }}>
        {policy.body.map((p, i) => (
          <p key={i} style={{ margin: 0 }}>
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}
