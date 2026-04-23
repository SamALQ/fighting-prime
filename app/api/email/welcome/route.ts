import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendTransactionalEmail, emailLayout } from "@/lib/email";

/** Optional welcome email right after signup (only when session exists, e.g. email confirmation off). */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ ok: false, skipped: true }, { status: 401 });
  }

  const base = process.env.NEXT_PUBLIC_APP_URL || "https://fightingprime.com";
  const result = await sendTransactionalEmail({
    to: user.email,
    subject: "Welcome to Fighting Prime Academy",
    html: emailLayout(`
      <h1 style="font-size:22px;margin:0 0 12px;">You're in, fighter.</h1>
      <p style="line-height:1.6;color:#aaa;margin:0 0 20px;">
        Thanks for joining ${"Fighting Prime Academy"}. Log in anytime to train, track progress, and level up.
      </p>
      <p style="margin:0;">
        <a href="${base}/dashboard" style="display:inline-block;padding:12px 20px;background:#D71212;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
          Go to dashboard
        </a>
      </p>
    `),
  });

  return NextResponse.json(result);
}
