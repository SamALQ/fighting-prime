import { Resend } from "resend";
import type { SupabaseClient } from "@supabase/supabase-js";

const APP_NAME = "Fighting Prime Academy";
const DEFAULT_FROM = "Fighting Prime <onboarding@resend.dev>";

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!resendClient) resendClient = new Resend(key);
  return resendClient;
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendTransactionalEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) {
    return { ok: false, skipped: true };
  }

  const from = process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM;

  try {
    const { error } = await resend.emails.send({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    if (error) {
      console.error("[email] Resend error:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[email] send failed:", message);
    return { ok: false, error: message };
  }
}

export async function getAuthUserEmail(
  admin: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data.user?.email) return null;
  return data.user.email;
}

export function emailLayout(innerHtml: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://fightingprime.com";
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:24px;background:#0B0B0B;color:#e5e5e5;font-family:system-ui,sans-serif;">
  <div style="max-width:560px;margin:0 auto;">
    <p style="font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#D71212;margin:0 0 16px;">${APP_NAME}</p>
    ${innerHtml}
    <p style="margin-top:32px;font-size:12px;color:#666;">${base}</p>
  </div>
</body>
</html>`;
}
