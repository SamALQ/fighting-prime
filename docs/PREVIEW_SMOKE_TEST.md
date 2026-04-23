# Preview / production smoke test (short)

Use after each deploy to **Preview** or **Production**.

## Auth

- [ ] `/signup` — create account (note email confirmation if enabled).
- [ ] `/login` — sign in.
- [ ] `/forgot-password` — request reset (check email / Supabase).

## Billing

- [ ] `/pricing` — open pricing.
- [ ] Start Checkout → complete (test card in test mode).
- [ ] Webhook: subscription row in Supabase; `/account` shows plan.
- [ ] Customer Portal — open, then cancel or manage plan.

## Content

- [ ] `/courses` — list loads.
- [ ] Open a course → episode with video → **play** (subscribed user for premium).
- [ ] Network: `/api/video?episodeId=` or presigned URL succeeds.
- [ ] `/breakdowns` — with active subscription, video plays; `/api/video?breakdownId=` returns 200.

## App shell

- [ ] Navbar — desktop links; mobile hamburger opens drawer.
- [ ] `/dashboard` — stats hero + no console errors.

## Admin (admin user only)

- [ ] `/admin` — loads.
- [ ] `/admin/courses` — list / edit smoke.

If any step fails, capture URL + user role + response body in **QA_BACKLOG.md**.
