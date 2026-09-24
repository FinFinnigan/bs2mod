// Session cookie — an opaque, httpOnly bearer token identifies an authenticated
// session. The cookie name lives in route-rules.ts (Edge-safe) and is re-exported
// here for the API routes.

import { DEFAULT_SESSION_TTL_MS } from "./service";
import { SESSION_COOKIE } from "./route-rules";

export { SESSION_COOKIE };

const MAX_AGE_SECONDS = Math.floor(DEFAULT_SESSION_TTL_MS / 1000);

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE_SECONDS,
  secure: process.env.NODE_ENV === "production",
};