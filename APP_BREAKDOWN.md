# Fighting Prime Academy — Full App Breakdown

## Overview

**Fighting Prime Academy** (FPA) is an online Muay Thai education platform built as a Next.js web application. It delivers structured video courses, technique breakdowns, and a gamified progress system — all led by **Jake Peacock**, a ONE Championship athlete. The production domain is `fightingprime.com`.

The app is currently a **frontend-only prototype/MVP**. There is no backend server, no database, and no payment processing. All data is hardcoded in TypeScript files, and all user state (auth, progress) is persisted in the browser's `localStorage`.

---

## Purpose

Provide an interactive, Netflix-style learning platform where users can:

1. Browse and watch Muay Thai training courses (video-based curriculum)
2. Track their progress, earn points, and level up through a gamification system
3. Access premium "Fighter Elite" features like personalized sparring video breakdowns
4. Learn from a structured, difficulty-graded course catalog

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.0.8 (App Router, Turbopack) |
| **Language** | TypeScript 5+ |
| **UI Library** | React 19.2.1 |
| **Styling** | Tailwind CSS v4, CSS custom properties (design tokens) |
| **Component Library** | shadcn/ui (New York variant) with Radix UI primitives |
| **Icons** | Lucide React |
| **Theming** | next-themes (dark mode default, system detection) |
| **Fonts** | Inter (Google Fonts), Bruce Forever (custom TTF, used for all headings) |
| **Animations** | tw-animate-css, custom keyframes (lightning, shimmer), canvas-confetti |
| **Media Hosting** | AWS S3 (`fp-course-content.s3.us-east-1.amazonaws.com`) for videos; Webflow CDN (`cdn.prod.website-files.com`) for images |
| **SEO** | JSON-LD structured data (Organization, Course, FAQ), dynamic sitemap, robots.txt, Open Graph / Twitter meta |
| **Auth** | Client-side only (localStorage) |
| **State Management** | React hooks + localStorage (no Redux, Zustand, or Context) |
| **Data Layer** | Static TypeScript files — no database, no API routes |

---

## Brand & Design

- **Primary color:** `#D71212` (red) — used across both light and dark themes
- **Dark mode** is the default theme
- **Light background:** `#FFFFFF` / **Dark background:** `#0B0B0B`
- **Card surfaces:** White (light) / `#1A1A1A` (dark)
- All headings use the **Bruce Forever** typeface in uppercase
- Body text uses **Inter**
- Design system uses shadcn/ui tokens mapped to CSS custom properties in `globals.css`

---

## Pages & Routes

### Public Pages

| Route | Page | Description |
|---|---|---|
| `/` | Home | Hero section, "How it Works" (4 steps), featured course spotlight, mock dashboard preview, monthly breakdowns, testimonials, and CTA |
| `/courses` | Course Catalog | Searchable, filterable grid of all courses. Filter by difficulty (Beginner / Intermediate / Advanced / Professional) |
| `/courses/[slug]` | Course Detail | Server-rendered. Course metadata, learning outcomes, episode list sidebar, SEO via JSON-LD |
| `/courses/[slug]/[episodeSlug]` | Episode Player | HTML5 video player with progress tracking, key takeaways, assignment placeholder, prev/next episode navigation, confetti on completion |
| `/breakdowns` | Technique Breakdowns | Selectable sidebar of technique breakdowns, video area, and comment section (UI only) |
| `/pricing` | Pricing | Two plans — Monthly ($20/mo) and Annual ($120/yr, 50% off). No payment integration |
| `/about` | About | Jake Peacock bio, mission statement, teaching philosophy |
| `/faq` | FAQ | Accordion-based FAQ with JSON-LD structured data |
| `/login` | Login | Email/password form with hardcoded test credentials |

### Authenticated Pages

| Route | Page | Description |
|---|---|---|
| `/dashboard` | User Dashboard | Stats (level, points, watch time, assignments), My Courses (tabbed: In Progress / Not Started / Completed), achievements grid, recent activity |
| `/fighter-elite` | Fighter Elite Dashboard | Premium tier. Latest breakdown card, sparring video upload (drag-and-drop UI), breakdown history sidebar |

### Other Routes

| Route | Description |
|---|---|
| `/home-sandbox1` | Alternate homepage layout experiment (no navbar, different hero) |
| `/sitemap.xml` | Auto-generated sitemap covering all courses and episodes |
| `/robots.txt` | Robots file allowing all crawlers, disallowing `/api/` and `/login` |
| `/_not-found` (404) | Custom 404 page with links to home and courses |

---

## Data Models

All data lives in `data/*.ts` files. There is no database.

### Course (`data/courses.ts`)

5 courses defined. Fields: `id`, `slug`, `title`, `tagline`, `difficulty`, `durationWeeks`, `featured`, `trailerUrl`, `syllabus` (episode slug array), `instructor`, `coverImage`, `learningOutcomes`, `released`, `releaseDate`, `totalPoints`, `difficultyMeterImage`, `posterImage`.

**Current courses:**
1. **Muay Thai Foundations** — Beginner, 8 weeks, 15 episodes (released)
2. **Low Kick Sharpshooter** — Intermediate, 2 weeks, 7 episodes (released)
3. **Elite Ringcraft** — Advanced, 3 weeks (unreleased)
4. **Fighter Finances** — Intermediate, 4 weeks (unreleased)
5. **Winning Mindset** — Professional, 4 weeks (unreleased)

Helper functions: `getCourseBySlug()`, `getCoursesByDifficulty()`

### Episode (`data/episodes.ts`)

~26 episodes across the two released courses. Fields: `slug`, `courseId`, `title`, `order`, `isFree`, `premium`, `videoUrl` (S3), `durationSeconds`, `keyTakeaways`, `releaseDate`, `hasAssignment`, `assignmentPoints`, `thumbnail`.

Helper functions: `parseDuration()`, `getEpisodesByCourseId()`, `getEpisodeBySlug()`

### Breakdown (`data/breakdowns.ts`)

5 technique breakdowns. Fields: `id`, `slug`, `title`, `description`, `videoUrl`, `thumbnail`, `releaseDate`, `author`.

### Elite Breakdown (`data/elite-breakdowns.ts`)

4 sample breakdowns for the Fighter Elite tier. Fields: `id`, `title`, `date`, `duration`, `description`, `points`, `videoUrl`, `thumbnail`, `status` (completed | pending).

### Testimonial (`data/testimonials.ts`)

4 testimonials. Fields: `id`, `name`, `location`, `quote`, `rating`.

### FAQ (`data/faq.ts`)

6 FAQ entries. Fields: `id`, `question`, `answer`.

---

## Authentication

**Mechanism:** Entirely client-side using `localStorage`. No server-side sessions, tokens, or backend validation.

**Hook:** `useAuth()` in `lib/hooks/use-auth.ts`

**Test credentials:**
- Email: `sam@alqdigital.com`
- Password: `S`

**Flow:**
1. User submits login form
2. Credentials are compared against a hardcoded `TEST_USER` object
3. On success, `isLoggedIn: "true"` and `userEmail` are stored in `localStorage`
4. Dashboard checks `isLoggedIn` and redirects to `/login` if false
5. Logout clears localStorage values

**Limitation:** No real authentication, no password hashing, no session management, no token refresh.

---

## Progress & Gamification System

**Hook:** `useProgress()` in `lib/hooks/use-progress.ts`

All progress is stored in `localStorage` under these keys:
- `episodeProgress` — percentage watched per episode (0-100)
- `watchTime` — seconds watched per episode
- `assignmentsCompleted` — array of completed episode slugs
- `coursesStarted` — array of started course IDs

### Points System

| Action | Points |
|---|---|
| Watching video | 0.5 points per second |
| Completing an episode (≥95% watched) | 100 points |

### Leveling

- **1,000 points per level**
- Level = `floor(totalPoints / 1000) + 1`
- Starting level: 1

### Features

- Episode progress tracking (percentage bar)
- Course-level progress (aggregated from episode watch times)
- Total watch time display
- Confetti animation on episode completion (via canvas-confetti)
- Lightning animations on completed episode indicators
- Achievements grid (currently hardcoded with placeholder data)
- Recent activity feed (mock data)

---

## Key Components

### Layout
- **`MainLayout`** — Wraps pages with NavBar + Footer
- **`NavBar`** — Sticky header with mega dropdown for courses, theme toggle, auth state
- **`Footer`** — Site links organized by Learn, About, Connect
- **`Container`** — Max-width wrapper (`max-w-7xl`)

### Video
- **`VideoPlayer`** — Custom HTML5 video player with play/pause, progress bar, time display, watch time tracking via `useProgress`, premium content lock overlay, confetti on completion

### Dashboard
- **`DashboardStats`** — Level, points, watch time, assignments completed
- **`MyCourses`** — Tabbed course list (In Progress / Not Started / Completed)
- **`AchievementsGrid`** — Grid of achievement badges
- **`RecentActivity`** — Activity feed

### SEO
- **`OrganizationJSONLD`** — Global structured data
- **`CourseJSONLD`** — Per-course structured data
- **`FAQJSONLD`** — FAQ page structured data

---

## Configuration

### `next.config.ts`
- Remote image patterns for: Webflow CDN, Unsplash, AWS S3

### `tsconfig.json`
- Path alias: `@/*` maps to project root
- Target: ES2017, strict mode, bundler module resolution

### `postcss.config.mjs`
- Uses `@tailwindcss/postcss` (Tailwind v4 PostCSS plugin)

### `components.json`
- shadcn/ui config: New York style, neutral base color, Lucide icons, CSS variables enabled

---

## What Works (Capabilities)

- Full course browsing and filtering experience
- Video playback with real S3-hosted content (for released courses)
- Per-episode and per-course progress tracking
- Points, leveling, and gamification feedback loop
- Dark/light theme switching
- Responsive layout
- SEO-ready with structured data, sitemap, and robots.txt
- Course detail pages with episode navigation
- Technique breakdown browsing
- Fighter Elite dashboard UI with upload drag-and-drop
- Login/logout flow (with test credentials)

---

## What Doesn't Work / Limitations

| Area | Limitation |
|---|---|
| **Authentication** | No real auth — hardcoded single test user, localStorage only, no security |
| **Payments** | Pricing page is display-only — no Stripe, no checkout, no subscription management |
| **Backend** | No server, no API routes, no database — all data is static TypeScript |
| **Video upload** | Fighter Elite upload zone is UI-only — drag-and-drop does nothing |
| **Comments** | Comment section on breakdowns is a visual placeholder — no persistence |
| **Assignments** | Episode assignments are mentioned but not implemented |
| **Achievements** | Achievement system is mostly hardcoded/mock data |
| **Recent activity** | Dashboard activity feed uses mock data |
| **User registration** | No signup flow — only the hardcoded test account exists |
| **Multi-user** | No concept of multiple users — localStorage is per-browser |
| **Unreleased courses** | 3 of 5 courses have no episodes or video content yet |
| **Search** | Course search is client-side text filtering only |
| **Mobile nav** | No hamburger/mobile menu — nav links may overflow on small screens |
| **Progressive web app** | No service worker, offline support, or PWA manifest |
| **Analytics** | No tracking or analytics integration |
| **Error boundaries** | No React error boundaries |
| **Testing** | No test files (unit, integration, or e2e) |

---

## File Structure (Key Directories)

```
fighting-prime/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout (ThemeProvider, fonts, metadata)
│   ├── page.tsx                # Home
│   ├── login/page.tsx
│   ├── dashboard/page.tsx
│   ├── courses/
│   │   ├── page.tsx            # Course catalog
│   │   └── [slug]/
│   │       ├── page.tsx        # Course detail
│   │       └── [episodeSlug]/page.tsx  # Episode player
│   ├── breakdowns/page.tsx
│   ├── fighter-elite/page.tsx
│   ├── pricing/page.tsx
│   ├── about/page.tsx
│   ├── faq/page.tsx
│   ├── home-sandbox1/page.tsx
│   ├── not-found.tsx
│   ├── sitemap.ts
│   ├── robots.ts
│   └── globals.css
├── components/
│   ├── layout/                 # NavBar, Footer, Container, Section, MainLayout
│   ├── ui/                     # All UI components + shadcn base components
│   │   └── dashboard/          # Dashboard-specific components
│   ├── seo/                    # JSON-LD structured data components
│   └── theme-provider.tsx
├── data/                       # Static data (courses, episodes, breakdowns, FAQ, testimonials)
├── lib/
│   ├── hooks/                  # useAuth, useProgress
│   └── utils.ts                # cn() utility
├── public/
│   └── fonts/                  # Bruce Forever custom font
├── next.config.ts
├── tsconfig.json
├── package.json
└── postcss.config.mjs
```

---

## Running the App

```bash
# Install dependencies
npm install

# Development server (hot reload)
npm run dev
# → http://localhost:3000

# Production build + start
npm run build && npm run start
# → http://localhost:3000
```

**Test login:** `sam@alqdigital.com` / `S`
