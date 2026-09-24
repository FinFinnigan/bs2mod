import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container" style={{ paddingTop: "var(--space-16)", textAlign: "center" }}>
      <h1 className="display">404</h1>
      <p style={{ color: "var(--color-ink-muted)", margin: "12px 0 24px" }}>
        We couldn&rsquo;t find that page.
      </p>
      <Link href="/" className="btn btn-primary">
        Back to home
      </Link>
    </div>
  );
}
