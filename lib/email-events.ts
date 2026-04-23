import { createAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalEmail, getAuthUserEmail, emailLayout } from "@/lib/email";

const baseUrl = () => process.env.NEXT_PUBLIC_APP_URL || "https://fightingprime.com";

/** Fire-and-forget; never throws to callers (webhooks / APIs). */
export function fireTransactionalEmail(
  fn: () => Promise<{ ok: boolean; skipped?: boolean; error?: string } | void>
): void {
  void Promise.resolve()
    .then(fn)
    .catch((e) => console.error("[email-events]", e));
}

export async function emailSubscriptionCheckoutComplete(userId: string): Promise<void> {
  const admin = createAdminClient();
  const to = await getAuthUserEmail(admin, userId);
  if (!to) return;
  const b = baseUrl();
  await sendTransactionalEmail({
    to,
    subject: "Your Fighting Prime subscription is active",
    html: emailLayout(`
      <h1 style="font-size:20px;margin:0 0 12px;">Subscription confirmed</h1>
      <p style="line-height:1.6;color:#aaa;margin:0 0 16px;">Premium access is unlocked. Jump into a course or pick up where you left off.</p>
      <p style="margin:0;"><a href="${b}/courses" style="color:#D71212;font-weight:600;">Browse courses →</a></p>
    `),
  });
}

export async function emailSubscriptionCancelled(userId: string): Promise<void> {
  const admin = createAdminClient();
  const to = await getAuthUserEmail(admin, userId);
  if (!to) return;
  const b = baseUrl();
  await sendTransactionalEmail({
    to,
    subject: "Your Fighting Prime subscription has ended",
    html: emailLayout(`
      <h1 style="font-size:20px;margin:0 0 12px;">Subscription cancelled</h1>
      <p style="line-height:1.6;color:#aaa;margin:0 0 16px;">We're sorry to see you go. You can rejoin anytime from the pricing page.</p>
      <p style="margin:0;"><a href="${b}/pricing" style="color:#D71212;font-weight:600;">View plans →</a></p>
    `),
  });
}

export async function emailAssignmentApproved(
  userId: string,
  points: number,
  feedbackSnippet: string
): Promise<void> {
  const admin = createAdminClient();
  const to = await getAuthUserEmail(admin, userId);
  if (!to) return;
  const b = baseUrl();
  const fb = feedbackSnippet ? `<p style="color:#ccc;margin:12px 0 0;">"${escapeHtml(feedbackSnippet.slice(0, 400))}"</p>` : "";
  await sendTransactionalEmail({
    to,
    subject: `Assignment approved — +${points} pts`,
    html: emailLayout(`
      <h1 style="font-size:20px;margin:0 0 8px;">Great work!</h1>
      <p style="line-height:1.6;color:#aaa;margin:0;">Your assignment was approved. You earned <strong style="color:#fff;">${points}</strong> points.</p>
      ${fb}
      <p style="margin:20px 0 0;"><a href="${b}/dashboard" style="color:#D71212;font-weight:600;">Open dashboard →</a></p>
    `),
  });
}

export async function emailAssignmentRevisionRequested(
  userId: string,
  feedback: string
): Promise<void> {
  const admin = createAdminClient();
  const to = await getAuthUserEmail(admin, userId);
  if (!to) return;
  const b = baseUrl();
  await sendTransactionalEmail({
    to,
    subject: "Revision requested on your assignment",
    html: emailLayout(`
      <h1 style="font-size:20px;margin:0 0 8px;">Instructor feedback</h1>
      <p style="line-height:1.6;color:#aaa;margin:0;">Please review the notes and submit an updated version when you're ready.</p>
      <p style="color:#ccc;margin:12px 0 0;">"${escapeHtml(feedback.slice(0, 600))}"</p>
      <p style="margin:20px 0 0;"><a href="${b}/dashboard" style="color:#D71212;font-weight:600;">Go to dashboard →</a></p>
    `),
  });
}

export async function emailEliteResponseReady(userId: string): Promise<void> {
  const admin = createAdminClient();
  const to = await getAuthUserEmail(admin, userId);
  if (!to) return;
  const b = baseUrl();
  await sendTransactionalEmail({
    to,
    subject: "Your Fighter Elite breakdown is ready",
    html: emailLayout(`
      <h1 style="font-size:20px;margin:0 0 8px;">Your coach responded</h1>
      <p style="line-height:1.6;color:#aaa;margin:0;">Open Fighter Elite to watch your personalized breakdown.</p>
      <p style="margin:20px 0 0;"><a href="${b}/fighter-elite" style="color:#D71212;font-weight:600;">Open Fighter Elite →</a></p>
    `),
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
