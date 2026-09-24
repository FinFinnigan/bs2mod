export function ErrorState({
  title = "Something went wrong",
  onRetry,
}: {
  title?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      style={{
        textAlign: "center",
        padding: "var(--space-16) var(--space-6)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <h2 style={{ fontSize: "var(--fs-h2)" }}>{title}</h2>
      <p style={{ color: "var(--color-ink-muted)", margin: 0 }}>
        Please try again. If it keeps happening, try refreshing the page.
      </p>
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
