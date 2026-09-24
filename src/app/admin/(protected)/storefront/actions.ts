"use server";

// Storefront template switch. Runs as a plain HTML form POST, self-gates on the
// admin session, fails closed when the database is unavailable, and reports an
// invalid selection by redirecting back with ?error=invalid.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasDatabase } from "@/lib/backend/db/client";
import { getApp } from "@/lib/backend/container";
import {
  isStorefrontTemplate,
  STOREFRONT_SETTINGS_KEY,
} from "@/lib/storefront/registry";
import { adminGateDecision } from "../../gate";
import { getAdminSession } from "../../session";

export async function setStorefrontTemplate(formData: FormData): Promise<void> {
  const session = await getAdminSession();
  const decision = adminGateDecision(session?.role);
  if (decision === "login") redirect("/admin/login");
  if (decision === "forbidden") redirect("/admin/forbidden");
  // Fail-closed: never fall through to a database call when it is unavailable.
  if (!hasDatabase()) redirect("/admin/storefront");

  const template = formData.get("template");
  if (!isStorefrontTemplate(template)) {
    redirect("/admin/storefront?error=invalid");
  }

  await getApp().settings.set(STOREFRONT_SETTINGS_KEY, template);
  revalidatePath("/", "layout");
  redirect("/admin/storefront");
}