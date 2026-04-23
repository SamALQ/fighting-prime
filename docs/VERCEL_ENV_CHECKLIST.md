# Vercel production environment checklist

Copy these into **Vercel → Project → Settings → Environment Variables** (Production). Values are not stored in this repo.

## Required

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** — never expose to the client |
| `STRIPE_SECRET_KEY` | Stripe secret (live for production) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for `https://fightingprime.com/api/webhooks/stripe` |
| `AWS_ACCESS_KEY_ID` | S3 access for presigned URLs / uploads |
| `AWS_SECRET_ACCESS_KEY` | S3 secret |
| `AWS_S3_BUCKET` | e.g. `fighting-prime-media` or `fp-course-content` |
| `AWS_S3_REGION` | e.g. `us-east-1` |
| `NEXT_PUBLIC_APP_URL` | `https://fightingprime.com` |

## Email (Resend)

| Variable | Notes |
|----------|--------|
| `RESEND_API_KEY` | From [resend.com](https://resend.com) — if unset, transactional emails are skipped |
| `RESEND_FROM_EMAIL` | Verified sender, e.g. `Fighting Prime <mail@yourdomain.com>` |

## Error monitoring (Sentry)

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_SENTRY_DSN` | Client + server DSN from Sentry project |
| `SENTRY_ORG` | Optional — for source map upload during `next build` |
| `SENTRY_PROJECT` | Optional — for source map upload |
| `SENTRY_AUTH_TOKEN` | Optional — CI / Vercel build for source maps |

If `NEXT_PUBLIC_SENTRY_DSN` is unset, Sentry init is skipped (no-op).

## Verify

1. Redeploy after changing env vars.
2. Hit `/api/me` while logged in (should not 500).
3. Stripe Dashboard → Webhooks → confirm recent deliveries succeed.
