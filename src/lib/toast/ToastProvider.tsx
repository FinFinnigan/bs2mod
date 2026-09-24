"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

interface Toast {
  id: number;
  message: string;
  kind?: "success" | "error";
}

const ToastContext = createContext<{ show: (message: string, kind?: "success" | "error") => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const show = useCallback(
    (message: string, kind: "success" | "error" = "success") => {
      const id = ++idRef.current;
      setToasts((t) => [...t, { id, message, kind }]);
      setTimeout(() => dismiss(id), 2500);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", zIndex: 80, display: "flex", flexDirection: "column", gap: 8, width: "max-content", maxWidth: "90vw" }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            style={{
              background: t.kind === "error" ? "var(--color-error)" : "var(--color-ink)",
              color: "#fff",
              padding: "10px 16px",
              borderRadius: "var(--radius-pill)",
              fontSize: "var(--fs-body)",
              fontWeight: 600,
              boxShadow: "var(--shadow-md)",
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
