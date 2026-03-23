# Fighting Prime Academy — Cursor Development Context

---

## What This Document Is

This is a context document for AI-assisted development of **Fighting Prime Academy (FPA)**. It should be kept in the project root or referenced in Cursor's project context so that Claude has full awareness of the project state, architecture decisions, and development workflow at all times.

---

## Project Summary

Fighting Prime Academy is a premium online Muay Thai training platform built in partnership with ONE Championship athlete Jake Peacock. It delivers structured video courses, technique breakdowns, and a gamified progress system through a Next.js web application.

**Production domain:** `fightingprime.com`

**Current state:** The app is a **fully functional platform** with Supabase Auth, a Postgres database (via Supabase), Stripe billing, role-based access control, instructor dashboards, watch time tracking, and a comments system. All content data lives in Supabase. User progress syncs across devices via API routes. Instructors have a dedicated portal with analytics, content management, and community features.

---

## Tech Stack

| Layer | Status |
|---|---|
| Framework | Next.js (App Router, Turbopack) |
| Language | TypeScript 5+ |
| UI | React 19, Tailwind CSS v4, shadcn/ui (New York) |
| Fonts | Inter (body), Bruce Forever (headings, custom TTF) |
| Theming | next-themes (dark mode default) |
| Auth | **Supabase Auth** (email/password, session cookies via middleware) |
| Database | **Supabase (Postgres)** with Row Level Security |
| Payments | **Stripe** (Checkout, Customer Portal, Webhooks) |
| Video Hosting | AWS S3 (`fp-course-content.s3.us-east-1.amazonaws.com`) |
| Image Hosting | Webflow CDN + S3 |
| Deployment | Vercel |

---

## Architecture

1. **Supabase is the backend.** Auth, database (Postgres), and row-level security. Server-side client via `@supabase/ssr`, browser client via `@supabase/supabase-js`.

2. **Stripe connects directly.** Stripe Checkout for purchases, Customer Portal for self-service billing, Webhooks sync subscription state to the `subscriptions` table.

3. **S3 for video storage.** Videos hosted on AWS S3. Currently served as direct URLs; presigned URL delivery is a planned hardening step.

4. **Role-based access via `profiles.role`.** Three roles: `user` (default), `instructor`, `admin`. Middleware enforces access on `/dashboard`, `/instructor`, `/admin` routes. RLS policies enforce data access.

5. **Watch time tracking.** Two systems: high-watermark progress (`user_progress`) for the learner dashboard, and accumulated watch events (`watch_events` + `watch_time_daily`) for instructor analytics and future payout calculations.

6. **Comments system.** Threaded comments on episodes and breakdowns, backed by a `comments` table with RLS. Instructors see all comments on their content in the instructor community page.

---

## Database Schema (Supabase)

| Table | Purpose |
|---|---|
| `profiles` | Extends `auth.users` with `full_name`, `role`, `created_at` |
| `subscriptions` | Stripe subscription state per user (plan, status, period) |
| `courses` | Course metadata (title, slug, difficulty, images, `instructor_id`) |
| `episodes` | Episode metadata per course (video URL, duration, order, free/premium) |
| `breakdowns` | Monthly technique breakdown content |
| `testimonials` | Homepage testimonials |
| `faq` | Pricing page FAQ entries |
| `user_progress` | Per user+episode: percent watched, watch time, completed |
| `user_course_progress` | Course-level "started" tracking |
| `instructors` | Instructor profiles (display name, bio, payout email, approved) |
| `watch_events` | Granular watch time deltas per user+episode+course |
| `watch_time_daily` | Daily aggregated watch time (populated by `pg_cron` at 3:15 AM) |
| `payout_periods` | Future: monthly payout period definitions |
| `instructor_payouts` | Future: per-instructor payout records |
| `comments` | Threaded comments on episodes and breakdowns |

---

## Pages & Routes

### Public Pages
- `/` — Home (marketing hero, featured course, testimonials)
- `/about` — About page
- `/courses` — Course listing
- `/courses/[slug]` — Course detail
- `/courses/[slug]/[episodeSlug]` — Episode detail with video player & comments
- `/breakdowns` — Technique breakdowns with comments
- `/pricing` — Plans & FAQ
- `/faq` — FAQ page

### Auth Pages
- `/login`, `/signup`, `/forgot-password`, `/reset-password`

### Protected Pages (require login)
- `/dashboard` — User dashboard (stats, courses in progress, achievements)
- `/fighter-elite` — Premium tier content (requires Fighter Elite subscription)
- `/account` — Account settings & billing

### Instructor Pages (require instructor/admin role)
- `/instructor` — Overview dashboard
- `/instructor/analytics` — Deep-dive analytics with date range picker
- `/instructor/content` — Course & episode management view
- `/instructor/community` — Recent comments from students
- `/instructor/earnings` — Payout tracking (placeholder for Phase D)
- `/instructor/settings` — Profile & payout email management

### Admin Pages (require admin role)
- `/admin` — Admin hub
- `/admin/instructors` — Instructor account management & course assignment

### API Routes
- `GET/POST /api/progress` — User progress read/write
- `POST /api/watch-events` — Accumulated watch time logging
- `GET/POST/PATCH/DELETE /api/comments` — Comments CRUD
- `GET /api/courses` — Course list for navbar
- `GET /api/me` — Current user + subscription snapshot
- `POST /api/checkout` — Stripe Checkout session creation
- `POST /api/billing/portal` — Stripe Customer Portal session
- `POST /api/webhooks/stripe` — Stripe webhook handler
- `GET /api/instructor/stats` — Instructor dashboard data
- `GET/PATCH /api/instructor/profile` — Instructor self-service profile
- `GET /api/instructor/comments` — Comments on instructor's content
- `GET/POST/PATCH /api/admin/instructors` — Admin instructor management
- `GET /api/admin/users` — Admin user search

---

## Key Components

- `VideoPlayer` — Custom HTML5 video player with resume prompt, scrubbing, volume, fullscreen, progress tracking, and watch event telemetry
- `CommentSection` — Threaded comments with reply, edit, delete support; used on episodes and breakdowns
- `NavBar` — Global nav with course mega-menu, role-aware dropdown (instructor/admin links)
- `MainLayout` — Standard page chrome (navbar + footer)
- Instructor layout (`app/instructor/layout.tsx`) — Sidebar + top bar for instructor portal

---

## What's Built vs. Remaining

### Completed
- Supabase Auth (signup, login, logout, password reset)
- Database schema & data migration from localStorage
- Stripe billing (Checkout, webhooks, subscription sync, content gating)
- Progress tracking (high-watermark + accumulated watch time)
- Video player enhancements (resume, scrubbing, volume, fullscreen)
- Instructor accounts (admin creation, approval, course assignment)
- Instructor portal (overview, analytics, content, community, earnings, settings)
- Comments system (threaded, on episodes + breakdowns)
- Role-based middleware (user, instructor, admin)
- Watch time daily aggregation via pg_cron

### Remaining / Future
- **Video security** — Presigned URLs for premium content (videos are currently direct S3 URLs)
- **Fighter Elite upload workflow** — Drag-and-drop UI exists but is not wired to real S3 uploads
- **Course forums** — Dedicated discussion threads per course (placeholder in instructor community)
- **Assignments** — Episode assignment submission & feedback (UI placeholder exists)
- **Payout processing** — Actual payment distribution to instructors (tables exist, logic deferred)
- **Admin CMS** — Upload/manage courses, episodes, breakdowns from admin panel
- **Email notifications** — Transactional emails (welcome, subscription, etc.)
- **Analytics** — Platform-wide analytics dashboard for admins
- **Mobile navigation** — Hamburger/slide-out menu for small screens

---

## Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=fp-course-content
AWS_S3_REGION=us-east-1

# App
NEXT_PUBLIC_APP_URL=https://fightingprime.com
```

---

## Brand & Design Reference

Do not change the visual design. For reference:

- **Primary color:** `#D71212` (red)
- **Dark mode default**, light mode available
- **Dark background:** `#0B0B0B` / **Card surfaces:** `#1A1A1A`
- **Headings:** Bruce Forever typeface, uppercase
- **Body:** Inter
- **Component library:** shadcn/ui (New York variant) with Radix UI primitives
- **Design tokens:** CSS custom properties in `globals.css`

Any new pages should match this existing design system exactly.

---

*Last updated: January 2026*
