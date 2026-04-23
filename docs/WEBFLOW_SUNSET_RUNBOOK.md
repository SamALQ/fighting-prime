# Webflow / Memberstack / Make sunset runbook

Use this for **DNS cutover**, **Stripe webhooks**, **smoke tests**, **subscriber migration**, and **post-launch monitoring**. Code changes are in the repo; the steps below are **operator actions** (you + Vercel + DNS + Stripe).

Quick checklist: **[PREVIEW_SMOKE_TEST.md](./PREVIEW_SMOKE_TEST.md)** · Env vars: **[VERCEL_ENV_CHECKLIST.md](./VERCEL_ENV_CHECKLIST.md)**

## 1. Preview deploy & smoke test (`preview-smoke`)

1. Push `main` (or open a PR) so Vercel creates a **Preview** deployment.
2. In Preview, set the same env vars as production (or use Vercel “Environment Variables” scoped to Preview).
3. Walk through:
   - `/signup` → `/login` → `/dashboard`
   - `/pricing` → Checkout (test mode) → confirm subscription in Stripe + app
   - Open a **premium** course episode → video plays (Network tab: `/api/video` returns presigned or fallback URL)
   - `/breakdowns` while logged in with subscription → video loads via `/api/video?breakdownId=…`
   - `/account` → Stripe Customer Portal opens
4. Run locally: `npm run build` (should pass on `main`).

## 2. DNS (`dns-cutover`)

1. Vercel → Project → **Domains** → add `fightingprime.com` and `www.fightingprime.com`.
2. At your DNS host, point records per Vercel’s instructions (usually A/CNAME for apex + `www`).
3. Wait for SSL “Valid” in Vercel. Confirm `https://fightingprime.com` loads the Next app.

## 3. Stripe webhook — production (`stripe-webhook-prod`)

1. Stripe Dashboard → **Developers → Webhooks** → Add endpoint:  
   `https://fightingprime.com/api/webhooks/stripe`
2. Subscribe to at least: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`.
3. Copy the **signing secret** into Vercel as `STRIPE_WEBHOOK_SECRET` (Production).
4. Redeploy so the server picks up the new secret.

## 4. Production smoke test (`prod-smoke-test`)

On **production** (after DNS + env):

1. New account: signup → login → dashboard.
2. Subscribe (use Stripe test mode **only** if production keys are test; otherwise use a real card you control).
3. Confirm premium episode plays; `/api/video` returns 200 for subscribed user.
4. Cancel via Customer Portal; confirm premium locks again.

## 5. Existing yearly subscriber (`migrate-subscriber`)

Follow **[map-existing-subscriber.md](./map-existing-subscriber.md)** exactly:

- Subscriber creates account at `/signup` with the **same email** as Stripe.
- You insert the `subscriptions` row in Supabase SQL Editor with their `user_id`.
- Optionally set Stripe customer metadata `supabase_user_id`.

## 6. Admin CMS walkthrough (`admin-walkthrough`)

With Jake (admin account):

1. `/admin/courses` — create or edit a course.
2. `/admin/episodes` — attach episode, set free/premium, confirm `video_resolutions` / uploads if used.
3. `/admin/breakdowns` — create or edit a breakdown.
4. `/admin/media` — confirm S3 list / upload works.

## 7. Final QA + backlog (`final-qa`, `qa-backlog`)

1. Mobile: open site on a phone — nav (hamburger), dashboard, course page, video.
2. Log issues in **[QA_BACKLOG.md](./QA_BACKLOG.md)** (non-blocking bugs after launch).
3. Only block launch for: auth broken, checkout broken, premium video exposed without sub, or total site outage.

## 8. Sunset Webflow / Memberstack / Make (`sunset-webflow`)

1. When production is stable and subscriber is migrated:
   - Webflow: unpublish site **or** 301 apex/`www` to Vercel (if not already via DNS).
   - Memberstack: disable new signups / cancel integration.
   - Make: pause scenarios that sync Webflow/Memberstack.
2. Keep Stripe as the billing source of truth (unchanged).

## 9. Post-launch 24h monitor (`post-launch-monitor`)

1. Stripe → Webhooks → watch for 4xx/5xx.
2. Vercel → Runtime logs for errors.
3. Supabase → Logs / API errors.
4. Watch support inbox for “can’t log in” / “video won’t play”.

---

**Reference:** Launch plan todos map 1:1 to sections above where applicable.
