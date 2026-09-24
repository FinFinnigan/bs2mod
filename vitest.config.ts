import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Minimal vitest config: resolve the Next.js "@/*" tsconfig path alias so the
// pure-logic suites under src/lib can import the data layer directly.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});