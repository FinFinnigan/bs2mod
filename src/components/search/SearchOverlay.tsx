"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { CatalogProduct } from "@/lib/data/products";
import { IconSearch, IconClose } from "@/components/ui/icons";
import { formatMoney } from "@/lib/currency";

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setQ("");
      setResults([]);
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    const query = q.trim();
    if (open && query) {
      const controller = new AbortController();
      const timer = setTimeout(async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/catalog/search?q=${encodeURIComponent(query)}`, {
            signal: controller.signal,
          });
          if (!res.ok) throw new Error("Search failed");
          const data = (await res.json()) as { products: CatalogProduct[] };
          setResults(data.products.slice(0, 5));
        } catch (e) {
          if ((e as Error).name !== "AbortError") setResults([]);
        } finally {
          if (!controller.signal.aborted) setLoading(false);
        }
      }, 200);
      return () => {
        clearTimeout(timer);
        controller.abort();
      };
    }
  }, [open, q]);

  if (!open) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    onClose();
  }

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="sheet" role="dialog" aria-modal="true" aria-label="Search" style={{ top: 0, left: 0, right: 0, maxHeight: "70dvh", borderBottom: "1px solid var(--color-border)" }}>
        <form onSubmit={submit} style={{ display: "flex", alignItems: "center", gap: 8, padding: "var(--space-4)", borderBottom: "1px solid var(--color-border)" }}>
          <IconSearch />
          <input
            autoFocus
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            aria-label="Search products"
            style={{ flex: 1, border: "none", outline: "none", fontSize: "var(--fs-body-lg)", background: "transparent", color: "var(--color-ink)" }}
          />
          <button type="button" className="header__icon" onClick={onClose} aria-label="Close search">
            <IconClose />
          </button>
        </form>

        {q.trim() && (
          <div style={{ padding: "var(--space-4)", overflowY: "auto" }}>
            {loading ? (
              <p style={{ color: "var(--color-ink-muted)" }}>Searching…</p>
            ) : results.length === 0 ? (
              <p style={{ color: "var(--color-ink-muted)" }}>No matches for &quot;{q}&quot;</p>
            ) : (
              <ul style={{ display: "flex", flexDirection: "column" }}>
                {results.map((p) => (
                  <li key={p.id}>
                    <Link href={p.href} onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 12, padding: "var(--space-2) 0" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image.src} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover" }} />
                      <span style={{ flex: 1, fontWeight: 600 }}>{p.name}</span>
                      <span className="tabular" style={{ color: "var(--color-ink-muted)" }}>
                        {formatMoney(p.price)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </>
  );
}