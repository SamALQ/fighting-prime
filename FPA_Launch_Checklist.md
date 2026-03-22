# Fighting Prime Academy — Launch Checklist

---

## Phase 1: Foundation (Supabase Database & Auth)

### 1.1 — Supabase Project Setup
- [ ] Create Supabase project
- [ ] Install Supabase client library in Next.js app (`@supabase/supabase-js`, `@supabase/ssr`)
- [ ] Configure environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
- [ ] Set up Supabase middleware for Next.js App Router (server-side session handling)

### 1.2 — Database Schema Design
- [ ] Design and create tables:
  - `profiles` (extends Supabase auth.users — name, role, avatar, tier, created_at)
  - `courses` (id, slug, title, tagline, difficulty, duration_weeks, featured, trailer_url, cover_image, poster_image, difficulty_meter_image, instructor, learning_outcomes, released, release_date, total_points, sort_order)
  - `episodes` (id, slug, course_id FK, title, order, is_free, premium, video_url, duration_seconds, key_takeaways, release_date, has_assignment, assignment_points, thumbnail)
  - `breakdowns` (id, slug, title, description, video_url, thumbnail, release_date, author)
  - `user_progress` (user_id FK, episode_id FK, percent_watched, watch_time_seconds, completed, completed_at)
  - `user_course_progress` (user_id FK, course_id FK, started_at, completed_at, status)
  - `achievements` (id, name, description, icon, criteria_type, criteria_value)
  - `user_achievements` (user_id FK, achievement_id FK, earned_at)
  - `subscriptions` (user_id FK, stripe_customer_id, stripe_subscription_id, plan, status, current_period_start, current_period_end)
  - `elite_submissions` (id, user_id FK, video_url, status [submitted/in_review/completed], submitted_at, response_video_url, responded_at, notes)
  - `testimonials` (id, name, location, quote, rating)
  - `faq` (id, question, answer, sort_order)
- [ ] Seed database with existing data from `data/*.ts` files
- [ ] Set up Row Level Security (RLS) policies for every table

### 1.3 — Authentication
- [ ] Enable Supabase Auth (email/password provider)
- [ ] Build signup page (`/signup`)
- [ ] Rebuild login page to use Supabase Auth (replace hardcoded credentials)
- [ ] Remove hardcoded `TEST_USER` and `useAuth` localStorage hook entirely
- [ ] Build server-side auth helpers (get session, protect routes)
- [ ] Add auth middleware to protect `/dashboard`, `/fighter-elite`, and admin routes
- [ ] Add password reset flow (forgot password page + email)
- [ ] Add role-based access: `user`, `instructor`, `admin`
- [ ] Migrate existing yearly subscriber's account (create their Supabase user, link to Stripe customer ID)

---

## Phase 2: Payments (Stripe Integration)

### 2.1 — Stripe Setup
- [ ] Create Stripe products and prices (Monthly $20/mo, Annual $120/yr)
- [ ] Install Stripe SDK (`stripe`, `@stripe/stripe-js`)
- [ ] Set up environment variables (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`)

### 2.2 — Checkout & Billing
- [ ] Build API route: `POST /api/checkout` — creates Stripe Checkout Session
- [ ] Build API route: `POST /api/webhooks/stripe` — handles Stripe webhook events
- [ ] Handle webhook events:
  - `checkout.session.completed` → create subscription record
  - `customer.subscription.updated` → update subscription status
  - `customer.subscription.deleted` → mark subscription cancelled
  - `invoice.paid` → confirm payment, extend access
  - `invoice.payment_failed` → flag account, send notification
- [ ] Rebuild pricing page with real Stripe Checkout buttons
- [ ] Build subscription management page (current plan, cancel, switch plans)
- [ ] Integrate Stripe Customer Portal for self-service billing
- [ ] Implement content gating: check subscription status before serving premium episodes
- [ ] Map existing yearly subscriber's Stripe customer to new system

---

## Phase 3: Data Migration (localStorage → Supabase)

### 3.1 — Progress System Rewrite
- [ ] Rewrite `useProgress` hook to read/write from Supabase instead of localStorage
- [ ] Build API routes or use Supabase client for:
  - Saving episode watch progress (debounced, every ~10 seconds)
  - Marking episodes complete
  - Fetching user's course progress
  - Calculating total points and level
- [ ] Remove all `localStorage` calls for progress data
- [ ] Ensure progress syncs across devices

### 3.2 — Dashboard Data
- [ ] Replace hardcoded achievements with real achievement logic (query `user_achievements`)
- [ ] Replace mock recent activity feed with real data (derived from `user_progress` timestamps)
- [ ] Dashboard stats (level, points, watch time, assignments) now query Supabase

### 3.3 — Course & Episode Data
- [ ] Replace static `data/courses.ts` imports with Supabase queries
- [ ] Replace static `data/episodes.ts` imports with Supabase queries
- [ ] Replace static `data/breakdowns.ts` imports with Supabase queries
- [ ] Replace static `data/testimonials.ts` and `data/faq.ts` with Supabase queries
- [ ] Verify all pages still render correctly with live data

---

## Phase 4: Video Infrastructure (S3 + Admin Uploads)

### 4.1 — Secure Video Delivery
- [ ] Build API route that generates S3 presigned URLs (time-limited, per-user)
- [ ] Video player now requests presigned URL from API instead of hitting S3 directly
- [ ] API checks user's subscription status before generating URL (free episodes bypass check)
- [ ] Remove hardcoded S3 URLs from frontend code

### 4.2 — Admin Upload System
- [ ] Build admin dashboard route (`/admin`) — protected by role check
- [ ] Course management UI:
  - View all courses
  - Create new course (title, slug, difficulty, description, cover image)
  - Edit existing course metadata
  - Reorder courses
- [ ] Episode management UI:
  - Add episode to a course
  - Drag-and-drop video upload (generates S3 presigned upload URL, uploads directly from browser)
  - Upload progress bar
  - Set episode metadata (title, order, free/premium, key takeaways, thumbnail)
  - Edit/reorder existing episodes
- [ ] Breakdown management UI:
  - Upload new technique breakdowns
  - Edit/delete existing breakdowns
- [ ] Make the admin UI simple enough for Jake — large buttons, clear labels, minimal steps

---

## Phase 5: Fighter Elite Features

### 5.1 — Member Submission Flow
- [ ] Wire up existing drag-and-drop upload UI to real S3 presigned uploads
- [ ] On upload: create `elite_submissions` record (status: submitted)
- [ ] Enforce monthly submission limit based on subscription tier
- [ ] Show submission history with status indicators (submitted → in review → completed)
- [ ] Email/notification to admin when new submission arrives

### 5.2 — Admin Response Flow
- [ ] Admin view: list of pending elite submissions
- [ ] Admin can watch submitted video
- [ ] Admin can upload response breakdown video
- [ ] Admin can add written notes/feedback
- [ ] On response: update `elite_submissions` record (status: completed, response_video_url)
- [ ] Email/notification to member when breakdown is ready

### 5.3 — Member Viewing
- [ ] Member can view their completed breakdowns (submitted video + Jake's response side by side or sequentially)
- [ ] Breakdown history with dates and any written notes

---

## Phase 6: Security & Code Quality Fixes

### 6.1 — Critical Security
- [ ] Remove all hardcoded credentials from codebase
- [ ] Ensure Supabase `service_role` key is NEVER exposed to the client
- [ ] Verify all RLS policies — test that users cannot access other users' data
- [ ] Validate that premium video URLs are not accessible without valid subscription
- [ ] Add rate limiting to API routes (especially auth, webhooks, uploads)
- [ ] Add CSRF protection to forms
- [ ] Sanitize all user inputs (especially admin CMS fields)

### 6.2 — Code Quality
- [ ] Add React Error Boundaries around VideoPlayer, Dashboard, and Admin panels
- [ ] Build mobile navigation (hamburger menu)
- [ ] Audit and remove unused components, experimental pages (`/home-sandbox1`)
- [ ] Add loading states and skeleton screens for async data fetches
- [ ] Add proper error handling and user-friendly error messages throughout
- [ ] Review and optimize Supabase queries (avoid N+1 patterns)

---

## Phase 7: Pre-Launch Polish

### 7.1 — Analytics & Monitoring
- [ ] Integrate analytics (Vercel Analytics, PostHog, or similar)
- [ ] Set up error monitoring (Sentry or similar)
- [ ] Add basic admin analytics dashboard (total users, active subs, popular courses)

### 7.2 — Email System
- [ ] Set up transactional emails (welcome, password reset, subscription confirmation)
- [ ] Set up notification emails (elite submission received, breakdown ready)
- [ ] Consider Resend, Postmark, or Supabase built-in email

### 7.3 — Deployment & DNS
- [ ] Verify Vercel deployment configuration
- [ ] Confirm `fightingprime.com` DNS points to Vercel
- [ ] Set up Supabase environment variables in Vercel
- [ ] Set up Stripe webhook endpoint pointing to production URL
- [ ] SSL/HTTPS verification
- [ ] Test full user flow end-to-end in production environment

### 7.4 — Final QA
- [ ] Test signup → login → browse → watch → track progress → level up
- [ ] Test subscribe → access premium → cancel → lose access
- [ ] Test admin login → create course → upload episode → publish
- [ ] Test elite submission → admin review → upload response → member views
- [ ] Test on mobile (iOS Safari, Android Chrome)
- [ ] Test on desktop (Chrome, Firefox, Safari)
- [ ] Verify SEO (structured data, sitemap, meta tags still work with dynamic data)
- [ ] Load test video playback

---

## Phase 8: Launch

- [ ] Sunset Webflow + Memberstack + Make system
- [ ] Notify existing yearly subscriber of platform migration (new login credentials)
- [ ] Go live
- [ ] Monitor for errors and performance issues in first 48 hours
- [ ] Post-launch: gather feedback, iterate

---

*Last updated: March 2026*
