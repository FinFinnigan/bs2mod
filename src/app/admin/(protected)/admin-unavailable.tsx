export function AdminUnavailable() {
  return (
    <div
      className="card-surface"
      style={{
        maxWidth: 560,
        margin: "var(--space-6) auto",
        padding: "var(--space-6)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
      }}
    >
      <h2>Admin unavailable</h2>
      <p style={{ margin: 0, color: "var(--color-ink-muted)" }}>
        The admin console needs a database connection. Set the DATABASE_URL
        environment variable, run the database migrations, then reload this page.
      </p>
    </div>
  );
}